import { useEffect, useState } from 'react'
import * as Tone from 'tone'

import { BitCrusherNode } from '../lib/BitCrusherNode'
import { CustomOscillatorNode } from '../lib/CustomOscillatorNode'

interface AudioNodes {
	customOscillator: CustomOscillatorNode | null;
	bitCrusher: Tone.BitCrusher | null;

	bitCrusherNode: BitCrusherNode | null;
}

export const useCustomOscAndBitCrusher = () => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [nodes, setNodes] = useState<AudioNodes>({
		customOscillator: null,
		bitCrusher: null,
		bitCrusherNode: null,
	});

	useEffect(() => {
		const customOscillator = new CustomOscillatorNode({ frequency: 220 });
		const bitCrusher = new Tone.BitCrusher(4);
		const bitCrusherNode = new BitCrusherNode().toDestination();
		bitCrusherNode.bits.value = 4;
		customOscillator.output.gain.value = 1;

		customOscillator.output.chain(bitCrusherNode);

		setNodes({ customOscillator, bitCrusherNode });

		return () => {
			if (isPlaying) {
				customOscillator.stop();

				bitCrusherNode.disconnect();
			}

			customOscillator.dispose();

			bitCrusherNode.dispose();
		};
	}, []);

	const startOscillator = () => {
		if (!isPlaying && nodes.customOscillator) {
			nodes.customOscillator.start();

			setIsPlaying(true);
		}
	};

	const stopOscillator = () => {
		if (isPlaying && nodes.customOscillator) {
			nodes.customOscillator.stop();
			setIsPlaying(false);
		}
	};

	return { isPlaying, startOscillator, stopOscillator };
};
