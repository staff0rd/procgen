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

// Ripple system for bubble pops
type Ripple = {
	x: number;
	z: number;
	startTime: number;
	strength: number;
};

const ripples: Ripple[] = [];
const MAX_RIPPLES = 20;
const RIPPLE_DURATION = 2.0;

function addRipple(x: number, z: number, strength: number, time: number) {
	ripples.push({ x, z, startTime: time, strength });
	if (ripples.length > MAX_RIPPLES) {
		ripples.shift();
	}
}

function getRippleDisplacement(x: number, z: number, time: number): number {
	let displacement = 0;
	for (let i = ripples.length - 1; i >= 0; i--) {
		const ripple = ripples[i];
		const age = time - ripple.startTime;
		if (age > RIPPLE_DURATION) {
			ripples.splice(i, 1);
			continue;
		}
		const dist = Math.sqrt((x - ripple.x) ** 2 + (z - ripple.z) ** 2);
		const waveRadius = age * 0.5;
		const ringWidth = 0.15;
		const ringDist = Math.abs(dist - waveRadius);
		if (ringDist < ringWidth) {
			const fade = 1 - age / RIPPLE_DURATION;
			const ringFade = 1 - ringDist / ringWidth;
			displacement +=
				Math.sin(dist * 20 - age * 8) *
				0.02 *
				fade *
				ringFade *
				ripple.strength;
		}
	}
	return displacement;
}

export const ocean = {
	SIZE,
	SEGMENTS,
	SAND_MESH_Y,
	WATER_MESH_Y,
	createSeededRandom,
	createSeededNoise2D,
	getWaveHeight,
	addRipple,
	getRippleDisplacement,
} as const;
