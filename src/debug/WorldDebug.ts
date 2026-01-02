import type { DebugPane } from "./DebugPane";
import {
	addColorBindings,
	debugConfig,
	type OcColorName,
	type OcShade,
} from "./debugConfig";

export function WorldDebug(pane: DebugPane) {
	const params = {
		seed: debugConfig.get().world.seed,
		colorName: debugConfig.get().world.backgroundColor.name,
		colorShade: debugConfig.get().world.backgroundColor.shade,
	};

	const updateSeed = () => {
		debugConfig.setSeed(params.seed);
	};

	const updateBackgroundColor = () => {
		debugConfig.setBackgroundColor({
			name: params.colorName as OcColorName,
			shade: params.colorShade as OcShade,
		});
	};

	const folder = pane.addFolder("World");
	folder
		.addBinding(params, "seed", {
			label: "Seed",
			min: 0,
			max: 9999,
			step: 1,
		})
		.on("change", updateSeed);
	addColorBindings(folder, params, updateBackgroundColor);

	return {
		onRestore: () => {
			updateSeed();
			updateBackgroundColor();
		},
	};
}
