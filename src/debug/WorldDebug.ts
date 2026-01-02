import type { DebugPane } from "./DebugPane";
import { debugConfig } from "./debugConfig";

export function WorldDebug(pane: DebugPane) {
	const params = {
		seed: debugConfig.get().world.seed,
	};

	const updateSeed = () => {
		debugConfig.setSeed(params.seed);
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

	return {
		onRestore: updateSeed,
	};
}
