import { useFrame } from "@react-three/fiber";
import oc from "open-color";
import { useRef } from "react";
import type * as THREE from "three";

export function Caustics() {
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
