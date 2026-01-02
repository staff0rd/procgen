import type { DebugPane } from "./DebugPane";
import {
	addColorBindings,
	debugConfig,
	type OcColorName,
	type OcShade,
} from "./debugConfig";

export function CreaturesDebug(pane: DebugPane) {
	const params = {
		starfishCount: debugConfig.get().creatures.starfishCount,
		starfishColorName: debugConfig.get().creatures.starfishColor.name,
		starfishColorShade: debugConfig.get().creatures.starfishColor.shade,
	};

	const updateStarfishCount = () => {
		debugConfig.setStarfishCount(params.starfishCount);
	};

	const updateStarfishColor = () => {
		debugConfig.setStarfishColor({
			name: params.starfishColorName as OcColorName,
			shade: params.starfishColorShade as OcShade,
		});
	};

	const folder = pane.addFolder("Starfish");

	folder
		.addBinding(params, "starfishCount", {
			label: "Count",
			min: 0,
			max: 20,
			step: 1,
		})
		.on("change", updateStarfishCount);

	addColorBindings(
		folder,
		{
			colorName: params.starfishColorName,
			colorShade: params.starfishColorShade,
		},
		updateStarfishColor,
	);

	return {
		onRestore: () => {
			updateStarfishCount();
			updateStarfishColor();
		},
	};
}
