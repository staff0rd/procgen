import { useFrame } from "@react-three/fiber";
import oc from "open-color";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ocean } from "./ocean";

const { SEGMENTS, SIZE, WATER_MESH_Y } = ocean;

export function Water() {
	const meshRef = useRef<THREE.Mesh>(null);

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
			positions.setY(i, waveHeight);
		}
		positions.needsUpdate = true;
		meshRef.current.geometry.computeVertexNormals();
	});

	return (
		<mesh ref={meshRef} geometry={geometry} position={[0, WATER_MESH_Y, 0]}>
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
