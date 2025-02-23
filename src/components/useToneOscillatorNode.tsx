import { useEffect, useState } from 'react'
import * as Tone from 'tone'

import { CustomOscillatorNode } from './CustomOscillatorNode'

interface AudioNodes {
	osc1: Tone.Oscillator | null;
	osc2: Tone.Oscillator | null;
	noise: Tone.Noise | null;
	customOscillator: CustomOscillatorNode | null;
}

export const useToneNode = () => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [nodes, setNodes] = useState<AudioNodes>({
		osc1: null,
		osc2: null,
		noise: null,
		customOscillator: null,
	});

	useEffect(() => {
		const osc1 = new Tone.Oscillator(440, 'sine').toDestination();
		const osc2 = new Tone.Oscillator(440, 'sine').toDestination();
		const noise = new Tone.Noise('pink').toDestination();
		const customOscillator = new CustomOscillatorNode({ frequency: 440 }).toDestination();

		// Set initial volumes
		osc1.volume.value = -100;
		osc2.volume.value = -100;
		noise.volume.value = -100;
		customOscillator.output.gain.value = 1;

		setNodes({ osc1, osc2, noise, customOscillator });

		return () => {
			if (isPlaying) {
				osc1.stop();
				osc2.stop();
				noise.stop();
				customOscillator.stop();
			}
			osc1.dispose();
			osc2.dispose();
			noise.dispose();
			customOscillator.dispose();
		};
	}, []);

	const startOscillator = () => {
		if (!isPlaying && nodes.osc1 && nodes.osc2 && nodes.noise && nodes.customOscillator) {
			nodes.osc1.start();
			nodes.osc2.start();
			nodes.noise.start();
			nodes.customOscillator.start();
			setIsPlaying(true);
		}
	};

	const stopOscillator = () => {
		if (isPlaying && nodes.osc1 && nodes.osc2 && nodes.noise && nodes.customOscillator) {
			nodes.osc1.stop();
			nodes.osc2.stop();
			nodes.noise.stop();
			nodes.customOscillator.stop();
			setIsPlaying(false);
		}
	};

	return { isPlaying, startOscillator, stopOscillator };
};
