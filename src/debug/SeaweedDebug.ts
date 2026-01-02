import type { DebugPane } from "./DebugPane";
import {
	addColorBindings,
	debugConfig,
	type OcColorName,
	type OcShade,
} from "./debugConfig";

export function SeaweedDebug(pane: DebugPane) {
	const params = {
		count: debugConfig.get().seaweed.count,
		minHeight: debugConfig.get().seaweed.minHeight,
		maxHeight: debugConfig.get().seaweed.maxHeight,
		colorName: debugConfig.get().seaweed.color.name,
		colorShade: debugConfig.get().seaweed.color.shade,
	};

	const updateCount = () => {
		debugConfig.setSeaweedCount(params.count);
	};

	const updateMinHeight = () => {
		debugConfig.setSeaweedMinHeight(params.minHeight);
	};

	const updateMaxHeight = () => {
		debugConfig.setSeaweedMaxHeight(params.maxHeight);
	};

	const updateColor = () => {
		debugConfig.setSeaweedColor({
			name: params.colorName as OcColorName,
			shade: params.colorShade as OcShade,
		});
	};

	const folder = pane.addFolder("Seaweed");
	folder
		.addBinding(params, "count", {
			label: "Count",
			min: 0,
			max: 100,
			step: 1,
		})
		.on("change", updateCount);
	folder
		.addBinding(params, "minHeight", {
			label: "Min Height",
			min: 0.1,
			max: 2.0,
			step: 0.1,
		})
		.on("change", updateMinHeight);
	folder
		.addBinding(params, "maxHeight", {
			label: "Max Height",
			min: 0.2,
			max: 3.0,
			step: 0.1,
		})
		.on("change", updateMaxHeight);
	addColorBindings(folder, params, updateColor);

	return {
		onRestore: () => {
			updateCount();
			updateMinHeight();
			updateMaxHeight();
			updateColor();
		},
	};
}
