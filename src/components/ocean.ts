import { createNoise2D } from "simplex-noise";

const SIZE = 4;
const SEGMENTS = 12;
const SAND_MESH_Y = -0.9;
const WATER_MESH_Y = 0.8;

// Simple seeded PRNG (mulberry32)
function createSeededRandom(seed: number) {
	return () => {
		seed |= 0;
		seed = (seed + 1831565813) | 0; // mulberry32 magic constant
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function createSeededNoise2D(seed: number) {
	return createNoise2D(createSeededRandom(seed));
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
	createSeededNoise2D,
	getWaveHeight,
} as const;
