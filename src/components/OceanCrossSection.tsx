import { Caustics } from "./Caustics";
import { Creatures } from "./Creatures";
import { Rocks } from "./Rocks";
import { Sand } from "./Sand";
import { Seaweed } from "./Seaweed";
import { VerticalBubbles } from "./VerticalBubbles";
import { Water } from "./Water";
import { WaterVolume } from "./WaterVolume";

export function OceanCrossSection() {
	return (
		<group>
			<Sand />
			<Rocks />
			<Creatures />
			<Seaweed />
			<VerticalBubbles />
			<WaterVolume />
			{/* Caustics positioned just above sand */}
			<group position={[0, -0.5, 0]}>
				<Caustics />
			</group>
			<Water />
		</group>
	);
}
