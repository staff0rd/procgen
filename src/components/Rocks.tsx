import { useMemo } from "react";
import * as THREE from "three";
import { ocToHex, useDebugConfig } from "../debug/debugConfig";
import { ocean } from "./ocean";

const { SIZE, SAND_MESH_Y, createSeededRandom, createSeededNoise2D } = ocean;

type RockInstance = {
	x: number;
	z: number;
	y: number;
	scale: number;
	rotationX: number;
	rotationY: number;
	rotationZ: number;
};

function createRockGeometry(seed: number): THREE.BufferGeometry {
	const random = createSeededRandom(seed);

	// Start with icosahedron for rock-like shape
	const geo = new THREE.IcosahedronGeometry(1, 1);
	const positions = geo.attributes.position;

	// Group vertices by position (vertices at same location need same displacement)
	// Use a string key for position lookup
	const positionKey = (x: number, y: number, z: number) =>
		`${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`;

	// Calculate displacement for each unique vertex position
	const displacements = new Map<string, number>();
	for (let i = 0; i < positions.count; i++) {
		const x = positions.getX(i);
		const y = positions.getY(i);
		const z = positions.getZ(i);
		const key = positionKey(x, y, z);

		if (!displacements.has(key)) {
			displacements.set(key, 0.7 + random() * 0.6);
		}
	}

	// Apply displacement to all vertices
	for (let i = 0; i < positions.count; i++) {
		const x = positions.getX(i);
		const y = positions.getY(i);
		const z = positions.getZ(i);

		const len = Math.sqrt(x * x + y * y + z * z);
		const nx = x / len;
		const ny = y / len;
		const nz = z / len;

		const key = positionKey(x, y, z);
		const displacement = displacements.get(key) ?? 1;

		positions.setX(i, nx * displacement);
		positions.setY(i, ny * displacement * 0.7); // Flatten slightly
		positions.setZ(i, nz * displacement);
	}

	positions.needsUpdate = true;
	geo.computeVertexNormals();

	return geo;
}

export function Rocks() {
	const { rocks, world } = useDebugConfig();

	const instances = useMemo(() => {
		const noise2D = createSeededNoise2D(world.seed);
		const random = createSeededRandom(world.seed + 2000);
		const result: RockInstance[] = [];

		for (let i = 0; i < rocks.count; i++) {
			// Scatter rocks across the sand area
			const x = (random() - 0.5) * SIZE * 0.9;
			const z = (random() - 0.5) * SIZE * 0.9;

			// Get sand height at this position
			const sandHeight =
				noise2D(x * 0.3, z * 0.3) * 0.15 + noise2D(x * 0.7, z * 0.7) * 0.05;

			const scale =
				rocks.minScale + random() * (rocks.maxScale - rocks.minScale);

			// Position rock so it sits on sand (half embedded)
			const y = SAND_MESH_Y + sandHeight + scale * 0.3;

			result.push({
				x,
				z,
				y,
				scale,
				rotationX: random() * Math.PI * 2,
				rotationY: random() * Math.PI * 2,
				rotationZ: random() * Math.PI * 0.3, // Less tilt on Z
			});
		}

		return result;
	}, [world.seed, rocks.count, rocks.minScale, rocks.maxScale]);

	// Create unique rock geometries for variety
	const rockGeometries = useMemo(() => {
		const geos: THREE.BufferGeometry[] = [];
		for (let i = 0; i < Math.min(5, rocks.count); i++) {
			geos.push(createRockGeometry(world.seed + 3000 + i * 100));
		}
		return geos;
	}, [world.seed, rocks.count]);

	const colorHex = ocToHex(rocks.color);

	return (
		<group>
			{instances.map((instance, i) => (
				<mesh
					key={`rock-${world.seed}-${i}`}
					position={[instance.x, instance.y, instance.z]}
					rotation={[
						instance.rotationX,
						instance.rotationY,
						instance.rotationZ,
					]}
					scale={instance.scale}
					geometry={rockGeometries[i % rockGeometries.length]}
				>
					<meshStandardMaterial color={colorHex} roughness={1} flatShading />
				</mesh>
			))}
		</group>
	);
}
