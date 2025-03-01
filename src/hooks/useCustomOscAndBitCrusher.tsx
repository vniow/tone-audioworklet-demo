import { useEffect, useState } from 'react'

// import * as Tone from 'tone';
import { BitCrusherNode } from '../lib/BitCrusherNode'
import { CustomOscillatorNode } from '../lib/CustomOscillatorNode'
import { initializeAudio } from '../lib/initializeAudio'

interface AudioNodes {
	customOscillator: CustomOscillatorNode | null;
	bitCrusherNode: BitCrusherNode | null;
}

export const useCustomOscAndBitCrusher = () => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [nodes, setNodes] = useState<AudioNodes>({
		customOscillator: null,
		bitCrusherNode: null,
	});
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		let mounted = true;

		const setup = async () => {
			try {
				// Ensure worklets are registered before creating nodes
				await initializeAudio();

				if (!mounted) return;

				const customOscillator = new CustomOscillatorNode({ frequency: 220 });
				const bitCrusherNode = new BitCrusherNode().toDestination();
				bitCrusherNode.bits.value = 4;
				customOscillator.output.gain.value = 1;

				customOscillator.output.chain(bitCrusherNode);

				setNodes({ customOscillator, bitCrusherNode });
				setIsInitialized(true);
			} catch (err) {
				console.error('Failed to initialize audio:', err);
			}
		};

		setup();

		return () => {
			mounted = false;
			if (isPlaying && nodes.customOscillator) {
				nodes.customOscillator.stop();
				if (nodes.bitCrusherNode) {
					nodes.bitCrusherNode.disconnect();
				}
			}

			if (nodes.customOscillator) {
				nodes.customOscillator.dispose();
			}

			if (nodes.bitCrusherNode) {
				nodes.bitCrusherNode.dispose();
			}
		};
	}, []);

	const startOscillator = () => {
		if (!isPlaying && nodes.customOscillator && isInitialized) {
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

	return { isPlaying, startOscillator, stopOscillator, isInitialized };
};
