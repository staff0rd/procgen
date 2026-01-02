import type { DebugPane } from "./DebugPane";
import {
	addColorBindings,
	debugConfig,
	type OcColorName,
	type OcShade,
} from "./debugConfig";

export function BubblesDebug(pane: DebugPane) {
	const params = {
		count: debugConfig.get().bubbles.count,
		minSize: debugConfig.get().bubbles.minSize,
		maxSize: debugConfig.get().bubbles.maxSize,
		minSpeed: debugConfig.get().bubbles.minSpeed,
		maxSpeed: debugConfig.get().bubbles.maxSpeed,
		opacity: debugConfig.get().bubbles.opacity,
		colorName: debugConfig.get().bubbles.color.name,
		colorShade: debugConfig.get().bubbles.color.shade,
	};

	const updateCount = () => {
		debugConfig.setBubblesCount(params.count);
	};

	const updateMinSize = () => {
		debugConfig.setBubblesMinSize(params.minSize);
	};

	const updateMaxSize = () => {
		debugConfig.setBubblesMaxSize(params.maxSize);
	};

	const updateMinSpeed = () => {
		debugConfig.setBubblesMinSpeed(params.minSpeed);
	};

	const updateMaxSpeed = () => {
		debugConfig.setBubblesMaxSpeed(params.maxSpeed);
	};

	const updateOpacity = () => {
		debugConfig.setBubblesOpacity(params.opacity);
	};

	const updateColor = () => {
		debugConfig.setBubblesColor({
			name: params.colorName as OcColorName,
			shade: params.colorShade as OcShade,
		});
	};

	const folder = pane.addFolder("Bubbles");
	folder
		.addBinding(params, "count", {
			label: "Count",
			min: 0,
			max: 100,
			step: 1,
		})
		.on("change", updateCount);
	folder
		.addBinding(params, "minSize", {
			label: "Min Size",
			min: 0.005,
			max: 0.05,
			step: 0.005,
		})
		.on("change", updateMinSize);
	folder
		.addBinding(params, "maxSize", {
			label: "Max Size",
			min: 0.01,
			max: 0.1,
			step: 0.005,
		})
		.on("change", updateMaxSize);
	folder
		.addBinding(params, "minSpeed", {
			label: "Min Speed",
			min: 0.01,
			max: 0.5,
			step: 0.01,
		})
		.on("change", updateMinSpeed);
	folder
		.addBinding(params, "maxSpeed", {
			label: "Max Speed",
			min: 0.05,
			max: 1.0,
			step: 0.05,
		})
		.on("change", updateMaxSpeed);
	folder
		.addBinding(params, "opacity", {
			label: "Opacity",
			min: 0.1,
			max: 1.0,
			step: 0.1,
		})
		.on("change", updateOpacity);
	addColorBindings(folder, params, updateColor);

	return {
		onRestore: () => {
			updateCount();
			updateMinSize();
			updateMaxSize();
			updateMinSpeed();
			updateMaxSpeed();
			updateOpacity();
			updateColor();
		},
	};
}
