import type { BgConfig } from "./prefabs/ParallaxBackground";

type Config = {
	background: Record<string, BgConfig>;
	backgrounds: Record<string, BgConfig>;
};
export default {
	backgrounds: {
		forest: {
			layers: [
				"sky",
				"clouds_1",
				"rocks",
				"clouds_2",
				"ground_1",
				"ground_2",
				"ground_3",
				"plant",
			],
			panSpeed: 0.2,
		},
	},
	background: {
		city: {
			layers: ["bgCity", "wood", "clouds_1", "rocks", "clouds_2", "plant"],
			panSpeed: 0.4,
		},
	},
} as Config;
