import { useFrame } from "@react-three/fiber";
import oc from "open-color";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ocean } from "./ocean";

const { getSandHeight, getWaveHeight, SEGMENTS, SIZE, WATER_MESH_Y } = ocean;

export function WaterVolume() {
	const meshRef = useRef<THREE.Mesh>(null);

	const { geometry, topVertexIndices } = useMemo(() => {
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
	}, []);

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

	return (
		<mesh ref={meshRef} geometry={geometry}>
			<meshStandardMaterial
				color={oc.blue[7]}
				transparent
				opacity={0.6}
				side={THREE.DoubleSide}
				flatShading
			/>
		</mesh>
	);
}
