import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ocToHex, useDebugConfig } from "../debug/debugConfig";
import { ocean } from "./ocean";

const { SEGMENTS, SIZE, WATER_MESH_Y, getRippleDisplacement } = ocean;

export function Water() {
	const meshRef = useRef<THREE.Mesh>(null);
	const { water } = useDebugConfig();

	const geometry = useMemo(() => {
		const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEGMENTS, SEGMENTS);
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
			const ripple = getRippleDisplacement(x, z, time);
			positions.setY(i, waveHeight + ripple);
		}
		positions.needsUpdate = true;
		meshRef.current.geometry.computeVertexNormals();
	});

	const colorHex = ocToHex(water.color);

	return (
		<mesh ref={meshRef} geometry={geometry} position={[0, WATER_MESH_Y, 0]}>
			<meshStandardMaterial
				color={colorHex}
				emissive={colorHex}
				emissiveIntensity={water.brightness - 1}
				transparent
				opacity={0.8}
				depthWrite={false}
				side={THREE.DoubleSide}
				flatShading
			/>
		</mesh>
	);
}
