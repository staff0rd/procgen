import type { DebugPane } from "./DebugPane";
import {
	addColorBindings,
	debugConfig,
	type OcColorName,
	type OcShade,
} from "./debugConfig";

export function RocksDebug(pane: DebugPane) {
	const params = {
		count: debugConfig.get().rocks.count,
		minScale: debugConfig.get().rocks.minScale,
		maxScale: debugConfig.get().rocks.maxScale,
		colorName: debugConfig.get().rocks.color.name,
		colorShade: debugConfig.get().rocks.color.shade,
	};

	const updateCount = () => {
		debugConfig.setRocksCount(params.count);
	};

	const updateMinScale = () => {
		debugConfig.setRocksMinScale(params.minScale);
	};

	const updateMaxScale = () => {
		debugConfig.setRocksMaxScale(params.maxScale);
	};

	const updateColor = () => {
		debugConfig.setRocksColor({
			name: params.colorName as OcColorName,
			shade: params.colorShade as OcShade,
		});
	};

	const folder = pane.addFolder("Rocks");
	folder
		.addBinding(params, "count", {
			label: "Count",
			min: 0,
			max: 50,
			step: 1,
		})
		.on("change", updateCount);
	folder
		.addBinding(params, "minScale", {
			label: "Min Scale",
			min: 0.02,
			max: 0.3,
			step: 0.01,
		})
		.on("change", updateMinScale);
	folder
		.addBinding(params, "maxScale", {
			label: "Max Scale",
			min: 0.05,
			max: 0.5,
			step: 0.01,
		})
		.on("change", updateMaxScale);
	addColorBindings(folder, params, updateColor);

	return {
		onRestore: () => {
			updateCount();
			updateMinScale();
			updateMaxScale();
			updateColor();
		},
	};
}
