import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import oc from "open-color";
import { useMemo, useRef } from "react";
import { createNoise2D } from "simplex-noise";
import * as THREE from "three";

function Caustics() {
	const lightsRef = useRef<THREE.Group>(null);

	useFrame(({ clock }) => {
		if (!lightsRef.current) return;
		const time = clock.getElapsedTime();

		lightsRef.current.children.forEach((light, i) => {
			const offset = i * 1.5;
			light.position.x = Math.sin(time * 0.7 + offset) * 1.2;
			light.position.z = Math.cos(time * 0.5 + offset * 0.8) * 1.2;
		});
	});

	return (
		<group ref={lightsRef}>
			{[0, 1, 2, 3].map((i) => (
				<pointLight
					key={i}
					position={[0, 0, 0]}
					intensity={0.8}
					distance={2.5}
					decay={2}
					color={oc.cyan[2]}
				/>
			))}
		</group>
	);
}

function Sand() {
	const geometry = useMemo(() => {
		const noise2D = createNoise2D();
		const segments = 12;
		const size = 4;
		const baseY = -0.5;

		// Create height map
		const heights: number[][] = [];
		for (let i = 0; i <= segments; i++) {
			heights[i] = [];
			for (let j = 0; j <= segments; j++) {
				const x = (i / segments - 0.5) * size;
				const z = (j / segments - 0.5) * size;
				heights[i][j] =
					noise2D(x * 0.3, z * 0.3) * 0.15 + noise2D(x * 0.7, z * 0.7) * 0.05;
			}
		}

		const geo = new THREE.BufferGeometry();
		const vertices: number[] = [];
		const indices: number[] = [];

		// Helper to add a vertex and return its index
		const addVertex = (x: number, y: number, z: number) => {
			const idx = vertices.length / 3;
			vertices.push(x, y, z);
			return idx;
		};

		// Top surface
		const topIndices: number[][] = [];
		for (let i = 0; i <= segments; i++) {
			topIndices[i] = [];
			for (let j = 0; j <= segments; j++) {
				const x = (i / segments - 0.5) * size;
				const z = (j / segments - 0.5) * size;
				topIndices[i][j] = addVertex(x, heights[i][j], z);
			}
		}

		// Top faces
		for (let i = 0; i < segments; i++) {
			for (let j = 0; j < segments; j++) {
				const a = topIndices[i][j];
				const b = topIndices[i + 1][j];
				const c = topIndices[i + 1][j + 1];
				const d = topIndices[i][j + 1];
				indices.push(a, b, c, a, c, d);
			}
		}

		// Side walls (4 sides)
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

		// Front edge (z = -size/2)
		const front = [];
		for (let i = 0; i <= segments; i++) {
			front.push({
				x: (i / segments - 0.5) * size,
				z: -size / 2,
				h: heights[i][0],
			});
		}
		addSideWall(front);

		// Back edge (z = size/2)
		const back = [];
		for (let i = segments; i >= 0; i--) {
			back.push({
				x: (i / segments - 0.5) * size,
				z: size / 2,
				h: heights[i][segments],
			});
		}
		addSideWall(back);

		// Left edge (x = -size/2)
		const left = [];
		for (let j = segments; j >= 0; j--) {
			left.push({
				x: -size / 2,
				z: (j / segments - 0.5) * size,
				h: heights[0][j],
			});
		}
		addSideWall(left);

		// Right edge (x = size/2)
		const right = [];
		for (let j = 0; j <= segments; j++) {
			right.push({
				x: size / 2,
				z: (j / segments - 0.5) * size,
				h: heights[segments][j],
			});
		}
		addSideWall(right);

		// Bottom face
		const bl = addVertex(-size / 2, baseY, -size / 2);
		const br = addVertex(size / 2, baseY, -size / 2);
		const tr = addVertex(size / 2, baseY, size / 2);
		const tl = addVertex(-size / 2, baseY, size / 2);
		indices.push(bl, br, tr, bl, tr, tl);

		geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
		geo.setIndex(indices);
		geo.computeVertexNormals();

		return geo;
	}, []);

	return (
		<mesh geometry={geometry} position={[0, -0.9, 0]}>
			<meshStandardMaterial
				color={oc.yellow[2]}
				roughness={1}
				flatShading
				side={THREE.DoubleSide}
			/>
		</mesh>
	);
}

function Water() {
	const meshRef = useRef<THREE.Mesh>(null);

	const geometry = useMemo(() => {
		const geo = new THREE.PlaneGeometry(4, 4, 8, 8);
		geo.rotateX(-Math.PI / 2);
		return geo;
	}, []);

	useFrame(({ clock }) => {
		if (!meshRef.current) return;
		const positions = meshRef.current.geometry.attributes.position;
		const time = clock.getElapsedTime();

		for (let i = 0; i < positions.count; i++) {
			const x = positions.getX(i);
			const z = positions.getZ(i);
			const waveHeight =
				Math.sin(x * 2 + time) * 0.15 + Math.sin(z * 1.5 + time * 0.8) * 0.12;
			positions.setY(i, waveHeight);
		}
		positions.needsUpdate = true;
		meshRef.current.geometry.computeVertexNormals();
	});

	return (
		<mesh ref={meshRef} geometry={geometry} position={[0, 0.8, 0]}>
			<meshStandardMaterial
				color={oc.blue[7]}
				transparent
				opacity={0.8}
				side={THREE.DoubleSide}
				flatShading
			/>
		</mesh>
	);
}

function OceanCrossSection() {
	return (
		<group>
			<Sand />
			{/* Caustics positioned just above sand */}
			<group position={[0, -0.5, 0]}>
				<Caustics />
			</group>
			<Water />
		</group>
	);
}

function App() {
	return (
		<Canvas
			style={{ width: "100vw", height: "100vh" }}
			camera={{ position: [5, 3, 5], fov: 50 }}
		>
			<color attach="background" args={[oc.gray[1]]} />
			<ambientLight intensity={0.5} />
			<directionalLight position={[5, 5, 5]} intensity={1} />
			<OceanCrossSection />
			<OrbitControls />
		</Canvas>
	);
}

export default App;
