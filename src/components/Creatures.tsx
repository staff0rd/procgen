import { useFrame } from "@react-three/fiber";
import oc from "open-color";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { type OcColor, useDebugConfig } from "../debug/debugConfig";
import { ocean } from "./ocean";

function getVariedColor(baseColor: OcColor, shadeOffset: number): string {
	const newShade = Math.max(0, Math.min(9, baseColor.shade + shadeOffset));
	const colorArray = oc[baseColor.name] as string[];
	return colorArray[newShade];
}

const { createSeededNoise2D, createSeededRandom, SAND_MESH_Y, SIZE } = ocean;

type CreatureInstance = {
	x: number;
	z: number;
	y: number;
	rotation: number;
	scale: number;
	phase: number;
	shadeOffset: number;
};

function generateCreatureInstances(
	worldSeed: number,
	creatureSeed: number,
	count: number,
	scaleMin: number,
	scaleRange: number,
	yOffset: number,
): CreatureInstance[] {
	const noise2D = createSeededNoise2D(worldSeed); // Must match Sand's noise
	const random = createSeededRandom(creatureSeed);
	const result: CreatureInstance[] = [];

	// Use grid-based jittered distribution for better spread
	const cols = Math.ceil(Math.sqrt(count));
	const cellSize = (SIZE * 0.7) / cols;

	for (let i = 0; i < count; i++) {
		const gridX = i % cols;
		const gridZ = Math.floor(i / cols);

		// Base position from grid + jitter
		const baseX = (gridX - cols / 2 + 0.5) * cellSize;
		const baseZ = (gridZ - cols / 2 + 0.5) * cellSize;
		const x = baseX + (random() - 0.5) * cellSize * 0.8;
		const z = baseZ + (random() - 0.5) * cellSize * 0.8;

		const sandHeight =
			noise2D(x * 0.3, z * 0.3) * 0.15 + noise2D(x * 0.7, z * 0.7) * 0.05;
		const scale = scaleMin + random() * scaleRange;
		const y = SAND_MESH_Y + sandHeight + scale * yOffset;

		result.push({
			x,
			z,
			y,
			rotation: random() * Math.PI * 2,
			scale,
			phase: random() * Math.PI * 2,
			shadeOffset: Math.floor(random() * 3) - 1,
		});
	}

	return result;
}

function createStarfishGeometry(): THREE.BufferGeometry {
	const vertices: number[] = [];
	const indices: number[] = [];

	const arms = 5;
	const armLength = 1.0;
	const armWidth = 0.25;
	const centerRadius = 0.25;
	const thickness = 0.08;
	const armSegments = 4;

	// Build star shape as a smooth radial profile
	// Create vertices by going around the star shape
	const profilePoints: { x: number; z: number; width: number }[] = [];

	for (let a = 0; a < arms; a++) {
		const armAngle = (a / arms) * Math.PI * 2;
		const nextArmAngle = ((a + 1) / arms) * Math.PI * 2;
		const midAngle = (armAngle + nextArmAngle) / 2;

		// Points along arm (from center outward)
		for (let s = 0; s <= armSegments; s++) {
			const t = s / armSegments;
			const dist = centerRadius + t * (armLength - centerRadius);
			const width = armWidth * (1 - t * 0.7); // taper toward tip
			profilePoints.push({
				x: Math.cos(armAngle) * dist,
				z: Math.sin(armAngle) * dist,
				width,
			});
		}

		// Valley between arms
		profilePoints.push({
			x: Math.cos(midAngle) * centerRadius * 0.6,
			z: Math.sin(midAngle) * centerRadius * 0.6,
			width: armWidth * 0.4,
		});
	}

	const numPoints = profilePoints.length;

	// Create top and bottom vertices for each profile point
	// Top center
	vertices.push(0, thickness, 0);
	const topCenterIdx = 0;

	// Bottom center
	vertices.push(0, -thickness * 0.5, 0);
	const bottomCenterIdx = 1;

	// Profile vertices (top ring, then bottom ring)
	const topStartIdx = 2;
	const bottomStartIdx = 2 + numPoints;

	for (const p of profilePoints) {
		vertices.push(p.x, thickness * 0.5, p.z); // top
	}
	for (const p of profilePoints) {
		vertices.push(p.x, -thickness * 0.3, p.z); // bottom (slightly thinner)
	}

	// Top faces (fan from center)
	for (let i = 0; i < numPoints; i++) {
		const next = (i + 1) % numPoints;
		indices.push(topCenterIdx, topStartIdx + i, topStartIdx + next);
	}

	// Bottom faces (fan from center, reversed winding)
	for (let i = 0; i < numPoints; i++) {
		const next = (i + 1) % numPoints;
		indices.push(bottomCenterIdx, bottomStartIdx + next, bottomStartIdx + i);
	}

	// Side faces (connect top and bottom rings)
	for (let i = 0; i < numPoints; i++) {
		const next = (i + 1) % numPoints;
		const t0 = topStartIdx + i;
		const t1 = topStartIdx + next;
		const b0 = bottomStartIdx + i;
		const b1 = bottomStartIdx + next;
		indices.push(t0, t1, b1);
		indices.push(t0, b1, b0);
	}

	const geo = new THREE.BufferGeometry();
	geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
	geo.setIndex(indices);
	geo.computeVertexNormals();

	return geo;
}

function Starfish({
	instance,
	geometry,
	baseColor,
}: {
	instance: CreatureInstance;
	geometry: THREE.BufferGeometry;
	baseColor: OcColor;
}) {
	const meshRef = useRef<THREE.Mesh>(null);
	const basePositions = useRef<Float32Array | null>(null);
	const color = getVariedColor(baseColor, instance.shadeOffset);

	useFrame(({ clock }) => {
		if (!meshRef.current) return;

		const positions = meshRef.current.geometry.attributes.position;

		// Store base positions on first frame
		if (!basePositions.current) {
			basePositions.current = new Float32Array(positions.array);
		}

		const time = clock.getElapsedTime();

		// Gentle arm undulation
		for (let i = 0; i < positions.count; i++) {
			const baseX = basePositions.current[i * 3];
			const baseY = basePositions.current[i * 3 + 1];
			const baseZ = basePositions.current[i * 3 + 2];

			// Distance from center affects wave amplitude
			const dist = Math.sqrt(baseX * baseX + baseZ * baseZ);
			const waveAmt = dist * 0.03;

			const wave = Math.sin(time * 0.5 + instance.phase + dist * 3) * waveAmt;

			positions.setY(i, baseY + wave);
		}

		positions.needsUpdate = true;
	});

	return (
		<mesh
			ref={meshRef}
			position={[instance.x, instance.y, instance.z]}
			rotation={[0, instance.rotation, 0]}
			scale={instance.scale}
			geometry={geometry.clone()}
		>
			<meshStandardMaterial
				color={color}
				roughness={1}
				flatShading
				side={THREE.DoubleSide}
			/>
		</mesh>
	);
}

export function Creatures() {
	const { creatures, world } = useDebugConfig();

	const starfishGeometry = useMemo(() => createStarfishGeometry(), []);

	const starfish = useMemo(
		() =>
			generateCreatureInstances(
				world.seed,
				world.seed + 5000,
				creatures.starfishCount,
				0.1,
				0.08,
				0.1,
			),
		[world.seed, creatures.starfishCount],
	);

	return (
		<group>
			{starfish.map((sf, i) => (
				<Starfish
					key={`starfish-${world.seed}-${i}`}
					instance={sf}
					geometry={starfishGeometry}
					baseColor={creatures.starfishColor}
				/>
			))}
		</group>
	);
}
