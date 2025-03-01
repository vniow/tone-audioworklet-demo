import { useEffect, useState } from 'react'

import { CustomOscillatorNode } from '../lib/CustomOscillatorNode'

// Generic type for effect nodes
type AudioEffectNode = {
	toDestination: () => any;
	disconnect: () => void;
	dispose: () => void;
};

// Configuration for the hook factory
interface AudioEffectConfig<T extends AudioEffectNode> {
	// Name for logging/debugging
	name: string;
	// Function to initialize audio worklets
	initialize: () => Promise<any>;
	// Function to create the effect node
	createEffectNode: (oscillator: CustomOscillatorNode) => T;
	// Optional function to configure nodes after creation
	configureNodes?: (oscillator: CustomOscillatorNode, effect: T) => void;
}

// Return type for all audio effect hooks
interface AudioEffectHookResult {
	isPlaying: boolean;
	startOscillator: () => void;
	stopOscillator: () => void;
	isInitialized: boolean;
}

export function createAudioEffectHook<T extends AudioEffectNode>(
	config: AudioEffectConfig<T>
): () => AudioEffectHookResult {
	return () => {
		const [isPlaying, setIsPlaying] = useState(false);
		const [nodes, setNodes] = useState<{
			customOscillator: CustomOscillatorNode | null;
			effectNode: T | null;
		}>({
			customOscillator: null,
			effectNode: null,
		});
		const [isInitialized, setIsInitialized] = useState(false);

		useEffect(() => {
			let mounted = true;

			const setup = async () => {
				try {
					// Initialize audio worklets
					await config.initialize();

					if (!mounted) return;

					// Create oscillator
					const customOscillator = new CustomOscillatorNode({ frequency: 220 });

					// Create effect node
					const effectNode = config.createEffectNode(customOscillator);

					// Apply additional configuration if provided
					if (config.configureNodes) {
						config.configureNodes(customOscillator, effectNode);
					}

					// Connect nodes
					customOscillator.output.chain(effectNode);

					setNodes({ customOscillator, effectNode });
					setIsInitialized(true);
				} catch (err) {
					console.error(`Failed to initialize ${config.name} audio:`, err);
				}
			};

			setup();

			return () => {
				mounted = false;
				// Clean up resources
				if (isPlaying && nodes.customOscillator) {
					nodes.customOscillator.stop();
					if (nodes.effectNode) {
						nodes.effectNode.disconnect();
					}
				}
				if (nodes.customOscillator) {
					nodes.customOscillator.dispose();
				}
				if (nodes.effectNode) {
					nodes.effectNode.dispose();
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
}
