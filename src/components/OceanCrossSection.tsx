import { Caustics } from "./Caustics";
import { Sand } from "./Sand";
import { Water } from "./Water";
import { WaterVolume } from "./WaterVolume";

export function OceanCrossSection() {
	return (
		<group>
			<Sand />
			<WaterVolume />
			{/* Caustics positioned just above sand */}
			<group position={[0, -0.5, 0]}>
				<Caustics />
			</group>
			<Water />
		</group>
	);
}
