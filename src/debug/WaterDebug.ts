import type { DebugPane } from "./DebugPane";
import {
	addColorBindings,
	debugConfig,
	type OcColorName,
	type OcShade,
} from "./debugConfig";

export function WaterDebug(pane: DebugPane) {
	const waterParams = {
		colorName: debugConfig.get().water.color.name,
		colorShade: debugConfig.get().water.color.shade,
		brightness: debugConfig.get().water.brightness,
	};

	const volumeParams = {
		colorName: debugConfig.get().waterVolume.color.name,
		colorShade: debugConfig.get().waterVolume.color.shade,
		brightness: debugConfig.get().waterVolume.brightness,
	};

	const updateWaterColor = () => {
		debugConfig.setWaterColor({
			name: waterParams.colorName as OcColorName,
			shade: waterParams.colorShade as OcShade,
		});
	};

	const updateWaterBrightness = () => {
		debugConfig.setWaterBrightness(waterParams.brightness);
	};

	const updateVolumeColor = () => {
		debugConfig.setWaterVolumeColor({
			name: volumeParams.colorName as OcColorName,
			shade: volumeParams.colorShade as OcShade,
		});
	};

	const updateVolumeBrightness = () => {
		debugConfig.setWaterVolumeBrightness(volumeParams.brightness);
	};

	const waterFolder = pane.addFolder("Water Surface");
	addColorBindings(waterFolder, waterParams, updateWaterColor);
	waterFolder
		.addBinding(waterParams, "brightness", {
			label: "Brightness",
			min: 0,
			max: 2,
			step: 0.1,
		})
		.on("change", updateWaterBrightness);

	const volumeFolder = pane.addFolder("Water Volume");
	addColorBindings(volumeFolder, volumeParams, updateVolumeColor);
	volumeFolder
		.addBinding(volumeParams, "brightness", {
			label: "Brightness",
			min: 0,
			max: 2,
			step: 0.1,
		})
		.on("change", updateVolumeBrightness);

	return {
		onRestore: () => {
			updateWaterColor();
			updateWaterBrightness();
			updateVolumeColor();
			updateVolumeBrightness();
		},
	};
}
