import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ocToHex, useDebugConfig } from "../debug/debugConfig";
import { ocean } from "./ocean";

const { SIZE, SAND_MESH_Y, createSeededRandom, getWaveHeight, addRipple } =
	ocean;

type BubbleInstance = {
	x: number;
	z: number;
	y: number;
	baseX: number;
	baseZ: number;
	size: number;
	speed: number;
	wobblePhase: number;
	wobbleFreq: number;
};

export function VerticalBubbles() {
	const { bubbles, world } = useDebugConfig();
	const bubblesRef = useRef<BubbleInstance[]>([]);
	const meshRef = useRef<THREE.InstancedMesh>(null);
	const dummy = useMemo(() => new THREE.Object3D(), []);

	// Initialize bubble instances with stratified distribution (all 4 quadrants)
	const initialBubbles = useMemo(() => {
		const random = createSeededRandom(world.seed + 3000);
		const result: BubbleInstance[] = [];

		for (let i = 0; i < bubbles.count; i++) {
			// Distribute evenly across 4 quadrants
			const quadrant = i % 4;
			const qx = quadrant % 2 === 0 ? -1 : 1;
			const qz = quadrant < 2 ? -1 : 1;

			// Random position within quadrant
			const baseX = qx * random() * SIZE * 0.5;
			const baseZ = qz * random() * SIZE * 0.5;

			// Start bubbles at random heights for visual variety
			const startY = SAND_MESH_Y + random() * 1.5;
			const size =
				bubbles.minSize + random() * (bubbles.maxSize - bubbles.minSize);
			const speed =
				bubbles.minSpeed + random() * (bubbles.maxSpeed - bubbles.minSpeed);

			result.push({
				x: baseX,
				z: baseZ,
				y: startY,
				baseX,
				baseZ,
				size,
				speed,
				wobblePhase: random() * Math.PI * 2,
				wobbleFreq: 1 + random() * 2,
			});
		}

		return result;
	}, [
		world.seed,
		bubbles.count,
		bubbles.minSize,
		bubbles.maxSize,
		bubbles.minSpeed,
		bubbles.maxSpeed,
	]);

	// Store current bubble state
	bubblesRef.current = initialBubbles;

	useFrame(({ clock }) => {
		if (!meshRef.current) return;

		const time = clock.getElapsedTime();
		const bubbleArray = bubblesRef.current;

		for (let i = 0; i < bubbleArray.length; i++) {
			const bubble = bubbleArray[i];

			// Rise upward
			bubble.y += bubble.speed * 0.016;

			// Horizontal wobble
			const wobble = Math.sin(time * bubble.wobbleFreq + bubble.wobblePhase);
			bubble.x = bubble.baseX + wobble * 0.03;
			bubble.z =
				bubble.baseZ +
				Math.cos(time * bubble.wobbleFreq * 0.7 + bubble.wobblePhase) * 0.02;

			// Check against actual wave height at this position
			const surfaceHeight = getWaveHeight(bubble.x, bubble.z, time);

			// Reset when reaching surface, add ripple
			if (bubble.y > surfaceHeight - bubble.size * 2) {
				addRipple(bubble.x, bubble.z, bubble.size * 20, time);
				bubble.y = SAND_MESH_Y + bubble.size;
			}

			// Update instance matrix
			dummy.position.set(bubble.x, bubble.y, bubble.z);
			dummy.scale.setScalar(bubble.size);
			dummy.updateMatrix();
			meshRef.current.setMatrixAt(i, dummy.matrix);
		}

		meshRef.current.instanceMatrix.needsUpdate = true;
	});

	const colorHex = ocToHex(bubbles.color);

	return (
		<instancedMesh
			ref={meshRef}
			args={[undefined, undefined, bubbles.count]}
			frustumCulled={false}
			renderOrder={1}
		>
			<sphereGeometry args={[1, 12, 12]} />
			<meshStandardMaterial
				color={colorHex}
				transparent
				opacity={bubbles.opacity}
				depthWrite={false}
				roughness={0.1}
				metalness={0.1}
			/>
		</instancedMesh>
	);
}
