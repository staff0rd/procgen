import { useEffect } from "react";
import { DebugPane } from "./DebugPane";
import { debugConfig, type OcColorName, type OcShade } from "./debugConfig";

const COLOR_NAMES: OcColorName[] = [
	"gray",
	"red",
	"pink",
	"grape",
	"violet",
	"indigo",
	"blue",
	"cyan",
	"teal",
	"green",
	"lime",
	"yellow",
	"orange",
];

export function DebugControls() {
	useEffect(() => {
		const pane = new DebugPane("Debug", true);

		const params = {
			water: {
				colorName: debugConfig.get().water.color.name,
				colorShade: debugConfig.get().water.color.shade,
				brightness: debugConfig.get().water.brightness,
			},
			sand: {
				colorName: debugConfig.get().sand.color.name,
				colorShade: debugConfig.get().sand.color.shade,
			},
			world: {
				seed: debugConfig.get().world.seed,
			},
		};

		const updateWaterColor = () => {
			debugConfig.setWaterColor({
				name: params.water.colorName as OcColorName,
				shade: params.water.colorShade as OcShade,
			});
		};

		const updateSandColor = () => {
			debugConfig.setSandColor({
				name: params.sand.colorName as OcColorName,
				shade: params.sand.colorShade as OcShade,
			});
		};

		// Reset button
		pane.addButton("Reset", () => pane.reset());

		// Water folder
		const waterFolder = pane.addFolder("Water");
		waterFolder
			.addBinding(params.water, "colorName", {
				label: "Color",
				options: Object.fromEntries(COLOR_NAMES.map((n) => [n, n])),
			})
			.on("change", updateWaterColor);
		waterFolder
			.addBinding(params.water, "colorShade", {
				label: "Shade",
				min: 0,
				max: 9,
				step: 1,
			})
			.on("change", updateWaterColor);
		waterFolder
			.addBinding(params.water, "brightness", {
				label: "Brightness",
				min: 0,
				max: 2,
				step: 0.1,
			})
			.on("change", () => {
				debugConfig.setWaterBrightness(params.water.brightness);
			});

		// Sand folder
		const sandFolder = pane.addFolder("Sand");
		sandFolder
			.addBinding(params.sand, "colorName", {
				label: "Color",
				options: Object.fromEntries(COLOR_NAMES.map((n) => [n, n])),
			})
			.on("change", updateSandColor);
		sandFolder
			.addBinding(params.sand, "colorShade", {
				label: "Shade",
				min: 0,
				max: 9,
				step: 1,
			})
			.on("change", updateSandColor);

		// World folder
		const worldFolder = pane.addFolder("World");
		worldFolder
			.addBinding(params.world, "seed", {
				label: "Seed",
				min: 0,
				max: 9999,
				step: 1,
			})
			.on("change", () => {
				debugConfig.setSeed(params.world.seed);
			});

		// Enable persistence and restore
		pane.enablePersistence();
		pane.onRestore(() => {
			updateWaterColor();
			debugConfig.setWaterBrightness(params.water.brightness);
			updateSandColor();
			debugConfig.setSeed(params.world.seed);
		});
		pane.restoreState();

		return () => {
			pane.dispose();
		};
	}, []);

	return null;
}
