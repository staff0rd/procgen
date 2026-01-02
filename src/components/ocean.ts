import { createNoise2D } from "simplex-noise";

const SIZE = 4;
const SEGMENTS = 12;
const SAND_MESH_Y = -0.9;
const WATER_MESH_Y = 0.8;

// Shared noise function (created once at module level so Sand and WaterVolume match)
const noise2D = createNoise2D();

function getSandHeight(x: number, z: number): number {
	return (
		SAND_MESH_Y +
		noise2D(x * 0.3, z * 0.3) * 0.15 +
		noise2D(x * 0.7, z * 0.7) * 0.05
	);
}

function getWaveHeight(x: number, z: number, time: number): number {
	return (
		WATER_MESH_Y +
		Math.sin(x * 2 + time) * 0.15 +
		Math.sin(z * 1.5 + time * 0.8) * 0.12
	);
}

export const ocean = {
	SIZE,
	SEGMENTS,
	SAND_MESH_Y,
	WATER_MESH_Y,
	noise2D,
	getSandHeight,
	getWaveHeight,
} as const;
