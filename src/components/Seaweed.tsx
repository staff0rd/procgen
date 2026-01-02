import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ocToHex, useDebugConfig } from "../debug/debugConfig";
import { ocean } from "./ocean";

const { SIZE, SAND_MESH_Y, createSeededNoise2D } = ocean;

const CONTROL_POINTS = 12;
const TUBE_SEGMENTS = 32;
const RADIAL_SEGMENTS = 8;
const LEAVES_PER_STALK = 4;
const LEAF_SEGMENTS = 6;

type SeaweedInstance = {
	x: number;
	z: number;
	baseY: number;
	height: number;
	phase: number;
	phaseX: number;
	phaseZ: number;
};

function createSeededRandom(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 1831565813) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

// Create a tapered leaf shape geometry with segments for animation
function createLeafGeometry(): THREE.BufferGeometry {
	const length = 0.12;
	const width = 0.04;
	const segments = LEAF_SEGMENTS;

	const vertices: number[] = [];
	const indices: number[] = [];

	// Create vertices along the leaf length
	for (let i = 0; i <= segments; i++) {
		const t = i / segments;
		const x = t * length;
		// Tapered width: starts narrow, widens in middle, narrows at tip
		const w = width * Math.sin(t * Math.PI) * (1 - t * 0.3);

		vertices.push(x, 0, -w / 2); // bottom edge
		vertices.push(x, 0, w / 2); // top edge
	}

	// Create faces
	for (let i = 0; i < segments; i++) {
		const a = i * 2;
		const b = i * 2 + 1;
		const c = i * 2 + 2;
		const d = i * 2 + 3;
		indices.push(a, c, b);
		indices.push(b, c, d);
	}

	const geo = new THREE.BufferGeometry();
	geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
	geo.setIndex(indices);
	geo.computeVertexNormals();

	return geo;
}

export function Seaweed() {
	const { seaweed, world } = useDebugConfig();
	const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
	const leafRefs = useRef<(THREE.Mesh | null)[][]>([]);

	const instances = useMemo(() => {
		const noise2D = createSeededNoise2D(world.seed);
		const random = createSeededRandom(world.seed + 1000);
		const result: SeaweedInstance[] = [];

		// Generate clusters
		const clusterCount = Math.max(1, Math.floor(seaweed.count / 4));
		const perCluster = Math.ceil(seaweed.count / clusterCount);
		const clusterRadius = 0.25;

		for (let c = 0; c < clusterCount; c++) {
			// Cluster center position
			const cx = (random() - 0.5) * SIZE * 0.8;
			const cz = (random() - 0.5) * SIZE * 0.8;

			// Generate seaweed within this cluster
			const countInCluster = Math.min(
				perCluster,
				seaweed.count - result.length,
			);

			for (let i = 0; i < countInCluster; i++) {
				// Position within cluster (gaussian-ish distribution)
				const angle = random() * Math.PI * 2;
				const dist = random() * random() * clusterRadius;
				const x = cx + Math.cos(angle) * dist;
				const z = cz + Math.sin(angle) * dist;

				const sandHeight =
					noise2D(x * 0.3, z * 0.3) * 0.15 + noise2D(x * 0.7, z * 0.7) * 0.05;
				const baseY = SAND_MESH_Y + sandHeight;

				const height =
					seaweed.minHeight +
					random() * (seaweed.maxHeight - seaweed.minHeight);

				result.push({
					x,
					z,
					baseY,
					height,
					phase: random() * Math.PI * 2,
					phaseX: random() * Math.PI * 2,
					phaseZ: random() * Math.PI * 2,
				});
			}
		}

		return result;
	}, [world.seed, seaweed.count, seaweed.minHeight, seaweed.maxHeight]);

	const baseRadius = 0.02;

	// Store original leaf geometry for reference
	const leafBaseGeo = useMemo(() => createLeafGeometry(), []);

	useFrame(({ clock }) => {
		const time = clock.getElapsedTime();

		for (let idx = 0; idx < instances.length; idx++) {
			const mesh = meshRefs.current[idx];
			const leaves = leafRefs.current[idx];
			if (!mesh) continue;

			const instance = instances[idx];
			const points: THREE.Vector3[] = [];

			// Generate control points for stalk
			for (let i = 0; i < CONTROL_POINTS; i++) {
				const t = i / (CONTROL_POINTS - 1);
				const y = t * instance.height;
				const swayStrength = t * t * 0.12;

				const offsetX =
					Math.sin(time * 0.8 + instance.phaseX + t * 2) * swayStrength +
					Math.sin(time * 0.5 + instance.phaseX * 1.5 + t * 1.5) *
						swayStrength *
						0.4;
				const offsetZ =
					Math.cos(time * 0.6 + instance.phaseZ + t * 1.8) * swayStrength +
					Math.cos(time * 0.9 + instance.phaseZ * 0.8 + t * 1.2) *
						swayStrength *
						0.3;

				points.push(new THREE.Vector3(offsetX, y, offsetZ));
			}

			const curve = new THREE.CatmullRomCurve3(points);

			// Update stalk geometry
			const newGeometry = new THREE.TubeGeometry(
				curve,
				TUBE_SEGMENTS,
				baseRadius,
				RADIAL_SEGMENTS,
				false,
			);

			const positions = newGeometry.attributes.position;
			for (let i = 0; i < positions.count; i++) {
				const y = positions.getY(i);
				const t = Math.max(0, Math.min(1, y / instance.height));
				const taper = 1 - t * 0.8;

				const x = positions.getX(i);
				const z = positions.getZ(i);
				const curveT = Math.max(0, Math.min(1, t));
				const curvePoint = curve.getPoint(curveT);

				const dx = x - curvePoint.x;
				const dz = z - curvePoint.z;
				positions.setX(i, curvePoint.x + dx * taper);
				positions.setZ(i, curvePoint.z + dz * taper);
			}

			positions.needsUpdate = true;
			newGeometry.computeVertexNormals();

			mesh.geometry.dispose();
			mesh.geometry = newGeometry;

			// Update leaves - position, orient, and animate wave
			if (leaves) {
				for (let li = 0; li < leaves.length; li++) {
					const leaf = leaves[li];
					if (!leaf) continue;

					const leafT = (li + 1.5) / (LEAVES_PER_STALK + 2);
					const curvePoint = curve.getPoint(leafT);

					// Position leaf on curve
					leaf.position.copy(curvePoint);

					// Orient leaf - point outward from stalk, alternating sides
					// Use stable world-up based orientation to prevent spinning
					const side = li % 2 === 0 ? 1 : -1;
					const angle = li * Math.PI * 0.6 + side * Math.PI * 0.5;

					leaf.rotation.set(0, angle, 0.3 * side);

					// Animate leaf vertices for flapping wave
					const leafPositions = leaf.geometry.attributes.position;
					const basePositions = leafBaseGeo.attributes.position;

					for (let vi = 0; vi < leafPositions.count; vi++) {
						const baseX = basePositions.getX(vi);
						const baseY = basePositions.getY(vi);
						const baseZ = basePositions.getZ(vi);

						// Gentle wave along leaf length
						const leafProgress = baseX / 0.12;
						const wavePhase =
							time * 1.5 + instance.phase + li * 1.2 + leafProgress * 2;
						const flapAmount = leafProgress * leafProgress * 0.008;
						const flap = Math.sin(wavePhase) * flapAmount;

						const twist = Math.sin(wavePhase * 0.5) * leafProgress * 0.003;

						leafPositions.setX(vi, baseX);
						leafPositions.setY(vi, baseY + flap);
						leafPositions.setZ(vi, baseZ + twist);
					}

					leafPositions.needsUpdate = true;
					leaf.geometry.computeVertexNormals();
				}
			}
		}
	});

	const colorHex = ocToHex(seaweed.color);

	return (
		<group>
			{instances.map((instance, i) => {
				// Initialize leaf refs array for this instance
				if (!leafRefs.current[i]) {
					leafRefs.current[i] = [];
				}

				return (
					<group
						key={`${world.seed}-${i}`}
						position={[instance.x, instance.baseY, instance.z]}
					>
						<mesh
							ref={(el) => {
								meshRefs.current[i] = el;
							}}
						>
							<tubeGeometry
								args={[
									new THREE.LineCurve3(
										new THREE.Vector3(0, 0, 0),
										new THREE.Vector3(0, instance.height, 0),
									),
									TUBE_SEGMENTS,
									baseRadius,
									RADIAL_SEGMENTS,
									false,
								]}
							/>
							<meshStandardMaterial color={colorHex} roughness={1} />
						</mesh>

						{/* Leaves with segmented geometry for flapping */}
						{Array.from({ length: LEAVES_PER_STALK }).map((_, li) => (
							<mesh
								key={`leaf-${world.seed}-${i}-${li}`}
								ref={(el) => {
									leafRefs.current[i][li] = el;
								}}
								geometry={createLeafGeometry()}
							>
								<meshStandardMaterial
									color={colorHex}
									roughness={1}
									side={THREE.DoubleSide}
								/>
							</mesh>
						))}
					</group>
				);
			})}
		</group>
	);
}
