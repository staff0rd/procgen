import { useMemo } from "react";
import * as THREE from "three";
import { ocToHex, useDebugConfig } from "../debug/debugConfig";
import { ocean } from "./ocean";

const { SEGMENTS, SIZE, SAND_MESH_Y, createSeededNoise2D } = ocean;

export function Sand() {
	const { sand, world } = useDebugConfig();

	const geometry = useMemo(() => {
		const noise2D = createSeededNoise2D(world.seed);
		const baseY = -0.5;

		// Create height map
		const heights: number[][] = [];
		for (let i = 0; i <= SEGMENTS; i++) {
			heights[i] = [];
			for (let j = 0; j <= SEGMENTS; j++) {
				const x = (i / SEGMENTS - 0.5) * SIZE;
				const z = (j / SEGMENTS - 0.5) * SIZE;
				heights[i][j] =
					noise2D(x * 0.3, z * 0.3) * 0.15 + noise2D(x * 0.7, z * 0.7) * 0.05;
			}
		}

		const geo = new THREE.BufferGeometry();
		const vertices: number[] = [];
		const indices: number[] = [];

		const addVertex = (x: number, y: number, z: number) => {
			const idx = vertices.length / 3;
			vertices.push(x, y, z);
			return idx;
		};

		// Top surface
		const topIndices: number[][] = [];
		for (let i = 0; i <= SEGMENTS; i++) {
			topIndices[i] = [];
			for (let j = 0; j <= SEGMENTS; j++) {
				const x = (i / SEGMENTS - 0.5) * SIZE;
				const z = (j / SEGMENTS - 0.5) * SIZE;
				topIndices[i][j] = addVertex(x, heights[i][j], z);
			}
		}

		// Top faces
		for (let i = 0; i < SEGMENTS; i++) {
			for (let j = 0; j < SEGMENTS; j++) {
				const a = topIndices[i][j];
				const b = topIndices[i + 1][j];
				const c = topIndices[i + 1][j + 1];
				const d = topIndices[i][j + 1];
				indices.push(a, b, c, a, c, d);
			}
		}

		// Side walls
		const addSideWall = (
			edgeVertices: { x: number; z: number; h: number }[],
		) => {
			for (let i = 0; i < edgeVertices.length - 1; i++) {
				const { x: x1, z: z1, h: h1 } = edgeVertices[i];
				const { x: x2, z: z2, h: h2 } = edgeVertices[i + 1];

				const a = addVertex(x1, h1, z1);
				const b = addVertex(x2, h2, z2);
				const c = addVertex(x2, baseY, z2);
				const d = addVertex(x1, baseY, z1);
				indices.push(a, b, c, a, c, d);
			}
		};

		// Front edge (z = -SIZE/2)
		const front = [];
		for (let i = 0; i <= SEGMENTS; i++) {
			front.push({
				x: (i / SEGMENTS - 0.5) * SIZE,
				z: -SIZE / 2,
				h: heights[i][0],
			});
		}
		addSideWall(front);

		// Back edge (z = SIZE/2)
		const back = [];
		for (let i = SEGMENTS; i >= 0; i--) {
			back.push({
				x: (i / SEGMENTS - 0.5) * SIZE,
				z: SIZE / 2,
				h: heights[i][SEGMENTS],
			});
		}
		addSideWall(back);

		// Left edge (x = -SIZE/2)
		const left = [];
		for (let j = SEGMENTS; j >= 0; j--) {
			left.push({
				x: -SIZE / 2,
				z: (j / SEGMENTS - 0.5) * SIZE,
				h: heights[0][j],
			});
		}
		addSideWall(left);

		// Right edge (x = SIZE/2)
		const right = [];
		for (let j = 0; j <= SEGMENTS; j++) {
			right.push({
				x: SIZE / 2,
				z: (j / SEGMENTS - 0.5) * SIZE,
				h: heights[SEGMENTS][j],
			});
		}
		addSideWall(right);

		// Bottom face
		const bl = addVertex(-SIZE / 2, baseY, -SIZE / 2);
		const br = addVertex(SIZE / 2, baseY, -SIZE / 2);
		const tr = addVertex(SIZE / 2, baseY, SIZE / 2);
		const tl = addVertex(-SIZE / 2, baseY, SIZE / 2);
		indices.push(bl, br, tr, bl, tr, tl);

		geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
		geo.setIndex(indices);
		geo.computeVertexNormals();

		return geo;
	}, [world.seed]);

	return (
		<mesh geometry={geometry} position={[0, SAND_MESH_Y, 0]}>
			<meshStandardMaterial
				color={ocToHex(sand.color)}
				roughness={1}
				flatShading
				side={THREE.DoubleSide}
			/>
		</mesh>
	);
}
