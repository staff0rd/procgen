import { useEffect } from "react";
import { DebugPane } from "./DebugPane";
import { SandDebug } from "./SandDebug";
import { SeaweedDebug } from "./SeaweedDebug";
import { WaterDebug } from "./WaterDebug";
import { WorldDebug } from "./WorldDebug";

export function DebugControls() {
	useEffect(() => {
		const pane = new DebugPane("Debug", true);

		// Reset button
		pane.addButton("Reset", () => pane.reset());

		// Add panes
		const water = WaterDebug(pane);
		const sand = SandDebug(pane);
		const seaweed = SeaweedDebug(pane);
		const world = WorldDebug(pane);

		// Enable persistence and restore
		pane.enablePersistence();
		pane.onRestore(() => {
			water.onRestore();
			sand.onRestore();
			seaweed.onRestore();
			world.onRestore();
		});
		pane.restoreState();

		return () => {
			pane.dispose();
		};
	}, []);

	return null;
}
