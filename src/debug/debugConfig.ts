import oc from "open-color";
import { useSyncExternalStore } from "react";

const COLOR_NAMES = [
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
] as const;

export type OcColorName = (typeof COLOR_NAMES)[number];

export type OcShade = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type OcColor = {
	name: OcColorName;
	shade: OcShade;
};

export function ocToHex(color: OcColor): string {
	return oc[color.name][color.shade];
}

export type DebugConfig = {
	water: {
		color: OcColor;
		brightness: number;
	};
	sand: {
		color: OcColor;
	};
	world: {
		seed: number;
	};
};

const defaultConfig: DebugConfig = {
	water: {
		color: { name: "blue", shade: 7 },
		brightness: 1.0,
	},
	sand: {
		color: { name: "yellow", shade: 2 },
	},
	world: {
		seed: 42,
	},
};

let config: DebugConfig = structuredClone(defaultConfig);
let listeners: Array<() => void> = [];

function emitChange() {
	for (const listener of listeners) {
		listener();
	}
}

export const debugConfig = {
	get(): DebugConfig {
		return config;
	},

	subscribe(listener: () => void): () => void {
		listeners = [...listeners, listener];
		return () => {
			listeners = listeners.filter((l) => l !== listener);
		};
	},

	setWaterColor(color: OcColor) {
		config = { ...config, water: { ...config.water, color } };
		emitChange();
	},

	setWaterBrightness(brightness: number) {
		config = { ...config, water: { ...config.water, brightness } };
		emitChange();
	},

	setSandColor(color: OcColor) {
		config = { ...config, sand: { ...config.sand, color } };
		emitChange();
	},

	setSeed(seed: number) {
		config = { ...config, world: { ...config.world, seed } };
		emitChange();
	},
};

export function useDebugConfig(): DebugConfig {
	return useSyncExternalStore(debugConfig.subscribe, debugConfig.get);
}

// biome-ignore lint/suspicious/noExplicitAny: tweakpane types incomplete
type FolderApi = any;

export function addColorBindings(
	folder: FolderApi,
	params: { colorName: string; colorShade: number },
	onChange: () => void,
) {
	folder
		.addBinding(params, "colorName", {
			label: "Color",
			options: Object.fromEntries(COLOR_NAMES.map((n) => [n, n])),
		})
		.on("change", onChange);
	folder
		.addBinding(params, "colorShade", {
			label: "Shade",
			min: 0,
			max: 9,
			step: 1,
		})
		.on("change", onChange);
}
