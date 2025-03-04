import { start } from 'tone'

import { initializeAudio } from '../lib/initializeNoiseGenerator'
import { NoiseGeneratorNode } from '../lib/NoiseGeneratorNode'
import { createNoiseAudioEffect } from './createNoiseAudioEffect'

export const useNoiseGenerator = createNoiseAudioEffect({
	name: 'NoiseGenerator',
	initialize: initializeAudio,
	createEffectNode: () =>
		new NoiseGeneratorNode({
			amplitude: 0.5,
			type: 0, // White noise by default
			start: false,
			stop: false,
		}).toDestination(),
	configureNodes: (noiseGen) => {
		// Additional configuration can be done here
		noiseGen.amplitude.value = 0.1; // Set a lower initial amplitude
	},
});
