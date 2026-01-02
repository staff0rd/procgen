import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ocToHex, useDebugConfig } from "../debug/debugConfig";
import { ocean } from "./ocean";

const {
	createSeededNoise2D,
	getWaveHeight,
	SEGMENTS,
	SIZE,
	SAND_MESH_Y,
	WATER_MESH_Y,
} = ocean;

export function WaterVolume() {
	const meshRef = useRef<THREE.Mesh>(null);
	const { waterVolume, world } = useDebugConfig();

	const { geometry, topVertexIndices } = useMemo(() => {
		const noise2D = createSeededNoise2D(world.seed);
		const getSandHeight = (x: number, z: number) =>
			SAND_MESH_Y +
			noise2D(x * 0.3, z * 0.3) * 0.15 +
			noise2D(x * 0.7, z * 0.7) * 0.05;

		const geo = new THREE.BufferGeometry();
		const vertices: number[] = [];
		const indices: number[] = [];
		const topIndices: number[] = [];

		const addVertex = (x: number, y: number, z: number, isTop: boolean) => {
			const idx = vertices.length / 3;
			vertices.push(x, y, z);
			if (isTop) topIndices.push(idx);
			return idx;
		};

		const createWall = (getPos: (t: number) => { x: number; z: number }) => {
			const bottomIndices: number[] = [];
			const topVertIndices: number[] = [];

			for (let i = 0; i <= SEGMENTS; i++) {
				const t = i / SEGMENTS;
				const { x, z } = getPos(t);
				const bottomY = getSandHeight(x, z);
				const topY = WATER_MESH_Y;

				bottomIndices.push(addVertex(x, bottomY, z, false));
				topVertIndices.push(addVertex(x, topY, z, true));
			}

			for (let i = 0; i < SEGMENTS; i++) {
				const bl = bottomIndices[i];
				const br = bottomIndices[i + 1];
				const tl = topVertIndices[i];
				const tr = topVertIndices[i + 1];
				indices.push(bl, br, tr, bl, tr, tl);
			}
		};

		// Front wall (z = -SIZE/2)
		createWall((t) => ({ x: (t - 0.5) * SIZE, z: -SIZE / 2 }));
		// Back wall (z = SIZE/2) - reversed winding
		createWall((t) => ({ x: (0.5 - t) * SIZE, z: SIZE / 2 }));
		// Left wall (x = -SIZE/2)
		createWall((t) => ({ x: -SIZE / 2, z: (0.5 - t) * SIZE }));
		// Right wall (x = SIZE/2)
		createWall((t) => ({ x: SIZE / 2, z: (t - 0.5) * SIZE }));

		geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
		geo.setIndex(indices);
		geo.computeVertexNormals();

		return { geometry: geo, topVertexIndices: topIndices };
	}, [world.seed]);

	useFrame(({ clock }) => {
		if (!meshRef.current) return;
		const positions = meshRef.current.geometry.attributes.position;
		const time = clock.getElapsedTime();

		for (const idx of topVertexIndices) {
			const x = positions.getX(idx);
			const z = positions.getZ(idx);
			positions.setY(idx, getWaveHeight(x, z, time));
		}

		positions.needsUpdate = true;
		meshRef.current.geometry.computeVertexNormals();
	});

	const colorHex = ocToHex(waterVolume.color);
	const adjustedColor = useMemo(() => {
		const color = new THREE.Color(colorHex);
		color.multiplyScalar(waterVolume.brightness);
		return color;
	}, [colorHex, waterVolume.brightness]);

	return (
		<mesh ref={meshRef} geometry={geometry}>
			<meshStandardMaterial
				color={adjustedColor}
				transparent
				opacity={0.6}
				depthWrite={false}
				side={THREE.DoubleSide}
				flatShading
			/>
		</mesh>
	);
}
