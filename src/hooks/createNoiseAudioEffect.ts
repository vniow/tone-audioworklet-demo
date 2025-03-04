import { useEffect, useState } from 'react'

// Generic type for noise generator nodes
type NoiseNode = {
	toDestination: () => unknown;
	start: () => void;
	stop: () => void;
	disconnect: () => void;
	dispose: () => void;
};

// Configuration for the noise hook factory
interface NoiseEffectConfig<T extends NoiseNode> {
	// Name for logging/debugging
	name: string;

	// Function to initialize audio worklets
	initialize: () => Promise<unknown>;

	// Function to create the noise generator node
	createEffectNode: () => T;

	// Optional function to configure nodes after creation
	configureNodes?: (noiseNode: T) => void;
}

// Return type for noise generator hooks
interface NoiseAudioHookResult {
	isPlaying: boolean;
	startNoise: () => void;
	stopNoise: () => void;
	isInitialized: boolean;
}

export function createNoiseAudioEffect<T extends NoiseNode>(config: NoiseEffectConfig<T>): () => NoiseAudioHookResult {
	return () => {
		const [isPlaying, setIsPlaying] = useState(false);
		const [noiseNode, setNoiseNode] = useState<T | null>(null);
		const [isInitialized, setIsInitialized] = useState(false);

		useEffect(() => {
			let mounted = true;

			const setup = async () => {
				try {
					// Initialize audio worklets
					await config.initialize();

					if (!mounted) return;

					// Create noise generator node
					const node = config.createEffectNode();

					// Apply additional configuration if provided
					if (config.configureNodes) {
						config.configureNodes(node);
					}

					setNoiseNode(node);
					setIsInitialized(true);
				} catch (err) {
					console.error(`Failed to initialize ${config.name} audio:`, err);
				}
			};

			setup();

			return () => {
				mounted = false;

				// Clean up resources
				if (isPlaying && noiseNode) {
					noiseNode.stop();
				}

				if (noiseNode) {
					noiseNode.disconnect();
					noiseNode.dispose();
				}
			};
		}, []);

		const startNoise = () => {
			if (!isPlaying && noiseNode && isInitialized) {
				noiseNode.start();
				setIsPlaying(true);
			}
		};

		const stopNoise = () => {
			if (isPlaying && noiseNode) {
				noiseNode.stop();
				setIsPlaying(false);
			}
		};

		return { isPlaying, startNoise, stopNoise, isInitialized };
	};
}
