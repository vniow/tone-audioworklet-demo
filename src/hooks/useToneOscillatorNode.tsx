import { useEffect, useState } from 'react'
import * as Tone from 'tone'

import { BitCrusherTest } from '../lib/BitCrusherTest'
import { CustomOscillatorNode } from '../lib/CustomOscillatorNode'

interface AudioNodes {
	// osc1: Tone.Oscillator | null;
	// osc2: Tone.Oscillator | null;
	// noise: Tone.Noise | null;
	customOscillator: CustomOscillatorNode | null;
	bitCrusher: Tone.BitCrusher | null;

	bitCrusherTest: BitCrusherTest | null;
}

export const useToneNode = () => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [nodes, setNodes] = useState<AudioNodes>({
		// osc1: null,
		// osc2: null,
		// noise: null,
		customOscillator: null,
		// bitCrusher: null,
		bitCrusherTest: null,
	});

	useEffect(() => {
		// const osc1 = new Tone.Oscillator(440, 'sine').toDestination();
		// const osc2 = new Tone.Oscillator(440, 'sine').toDestination();

		const customOscillator = new CustomOscillatorNode({ frequency: 220 });
		const bitCrusher = new Tone.BitCrusher(4).toDestination();
		const bitCrusherTest = new BitCrusherTest().toDestination();
		bitCrusherTest.bits.value = 1;

		// Set initial volumes
		// osc1.volume.value = -100;
		// osc2.volume.value = -100;

		customOscillator.output.gain.value = 1;

		// customOscillator.output.chain(bitCrusher);
		customOscillator.output.chain(bitCrusherTest);

		setNodes({ customOscillator, bitCrusherTest });

		return () => {
			if (isPlaying) {
				// osc1.stop();
				// osc2.stop();
				// noise.stop();
				customOscillator.stop();
				// bitCrusher.disconnect(); // ensure bitCrusher is included in cleanup
				bitCrusherTest.disconnect(); // ensure bitCrusherTest is included in cleanup
			}
			// osc1.dispose();
			// osc2.dispose();
			// noise.dispose();
			customOscillator.dispose();
			// bitCrusher.dispose(); // ensure bitCrusher is included in cleanup
			bitCrusherTest.dispose(); // ensure bitCrusherTest is included in cleanup
		};
	}, []);

	const startOscillator = () => {
		if (!isPlaying && nodes.customOscillator) {
			// nodes.osc1.start();
			// nodes.osc2.start();
			// nodes.noise.start();
			nodes.customOscillator.start();

			setIsPlaying(true);
		}
	};

	const stopOscillator = () => {
		if (isPlaying && nodes.customOscillator) {
			// nodes.osc1.stop();
			// nodes.osc2.stop();
			nodes.customOscillator.stop();
			setIsPlaying(false);
		}
	};

	return { isPlaying, startOscillator, stopOscillator };
};
