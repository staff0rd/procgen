import type { DebugPane } from "./DebugPane";
import {
	addColorBindings,
	debugConfig,
	type OcColorName,
	type OcShade,
} from "./debugConfig";

export function WaterDebug(pane: DebugPane) {
	const params = {
		colorName: debugConfig.get().water.color.name,
		colorShade: debugConfig.get().water.color.shade,
		brightness: debugConfig.get().water.brightness,
	};

	const updateColor = () => {
		debugConfig.setWaterColor({
			name: params.colorName as OcColorName,
			shade: params.colorShade as OcShade,
		});
	};

	const updateBrightness = () => {
		debugConfig.setWaterBrightness(params.brightness);
	};

	const folder = pane.addFolder("Water");
	addColorBindings(folder, params, updateColor);
	folder
		.addBinding(params, "brightness", {
			label: "Brightness",
			min: 0,
			max: 2,
			step: 0.1,
		})
		.on("change", updateBrightness);

	return {
		onRestore: () => {
			updateColor();
			updateBrightness();
		},
	};
}
