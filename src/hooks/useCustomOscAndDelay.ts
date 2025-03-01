import { useEffect, useState } from 'react'

import { CustomOscillatorNode } from '../lib/CustomOscillatorNode'
import { DelayNode } from '../lib/DelayNode'
import { initializeAudio } from '../lib/initializeDelay'

interface AudioNodes {
	customOscillator: CustomOscillatorNode | null;
	delayNode: DelayNode | null;
}

export const useCustomOscAndDelay = () => {
	const [isPlaying, setIsPlaying] = useState(false);
	const [nodes, setNodes] = useState<AudioNodes>({
		customOscillator: null,
		delayNode: null,
	});
	const [isInitialized, setIsInitialized] = useState(false);

	useEffect(() => {
		let mounted = true;

		const setup = async () => {
			try {
				await initializeAudio();

				if (!mounted) return;

				const customOscillator = new CustomOscillatorNode({ frequency: 220 });
				const delayNode = new DelayNode({
					delayTime: 0.25,
					feedback: 0.5,
				}).toDestination();

				customOscillator.output.chain(delayNode);

				setNodes({ customOscillator, delayNode });
				setIsInitialized(true);
			} catch (err) {
				console.error('Failed to initialize audio:', err);
			}
		};

		setup();

		return () => {
			mounted = false;
			// Clean up resources
			if (isPlaying && nodes.customOscillator) {
				nodes.customOscillator.stop();
				if (nodes.delayNode) {
					nodes.delayNode.disconnect();
				}
			}
			if (nodes.customOscillator) {
				nodes.customOscillator.dispose();
			}
			if (nodes.delayNode) {
				nodes.delayNode.dispose();
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
