import type { DebugPane } from "./DebugPane";
import {
	addColorBindings,
	debugConfig,
	type OcColorName,
	type OcShade,
} from "./debugConfig";

export function SandDebug(pane: DebugPane) {
	const params = {
		colorName: debugConfig.get().sand.color.name,
		colorShade: debugConfig.get().sand.color.shade,
	};

	const updateColor = () => {
		debugConfig.setSandColor({
			name: params.colorName as OcColorName,
			shade: params.colorShade as OcShade,
		});
	};

	const folder = pane.addFolder("Sand");
	addColorBindings(folder, params, updateColor);

	return {
		onRestore: updateColor,
	};
}
