import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

import { NoiseGeneratorNode } from '../lib/NoiseGeneratorNode'
import { getWorkletGlobalScope } from '../lib/WorkletGlobalScope'
import { workletName } from '../worklets/NoiseGenerator.worklet'

// Options interface for the noise generator hook
export interface NoiseGeneratorOptions {
	noiseType?: number; // 0: white, 1: pink, 2: brown, 3: digital
	wet?: number; // 0-1 range
}

// Return type for the hook
export interface NoiseGeneratorHookResult {
	noiseGeneratorNode: NoiseGeneratorNode | null;
	isInitialized: boolean;
	isPlaying: boolean;
	noiseType: number;
	wet: number;
	setNoiseType: (value: number) => void;
	setWet: (value: number) => void;
	startNoise: () => Promise<void>;
	stopNoise: () => Promise<void>;
}

/**
 * A hook to create and manage a NoiseGeneratorNode
 *
 * @param options - Configuration options for the noise generator
 * @returns The noise generator control interface
 */
export const useNoiseWorklet = (
	options: NoiseGeneratorOptions = {}
): NoiseGeneratorHookResult => {
	// Default values
	const defaultNoiseType = 0; // white noise by default
	const defaultWet = 1; // fully wet by default

	// State for UI and external tracking
	const [noiseType, setNoiseTypeState] = useState(
		options.noiseType !== undefined ? options.noiseType : defaultNoiseType
	);
	const [wet, setWetState] = useState(
		options.wet !== undefined ? options.wet : defaultWet
	);
	const [isInitialized, setIsInitialized] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);

	// Refs to prevent recreation of nodes
	const noiseGeneratorNodeRef = useRef<NoiseGeneratorNode | null>(null);
	const noiseTypeRef = useRef(noiseType);
	const wetRef = useRef(wet);
	const mountedRef = useRef(true);

	// Initialize noise generator on mount
	useEffect(() => {
		mountedRef.current = true;
		console.log('🎛️ Initializing NoiseGenerator worklet...');

		const setupNoiseGenerator = async () => {
			try {
				// Initialize audio context
				await Tone.start();

				// Register worklets
				const audioWorkletBlob = new Blob([getWorkletGlobalScope()], {
					type: 'text/javascript',
				});
				const workletUrl = URL.createObjectURL(audioWorkletBlob);

				try {
					await Tone.getContext().addAudioWorkletModule(workletUrl);
					console.log(`Successfully registered audio worklets: ${workletName}`);
				} catch (error) {
					console.error('Failed to register audio worklets:', error);
					throw error;
				} finally {
					URL.revokeObjectURL(workletUrl);
				}

				// Only continue if component is still mounted
				if (!mountedRef.current) return;

				// Create a noise generator node
				const newNoiseGeneratorNode = new NoiseGeneratorNode({
					noiseType: noiseTypeRef.current,
					wet: wetRef.current,
				});

				// Store reference
				noiseGeneratorNodeRef.current = newNoiseGeneratorNode;
				setIsInitialized(true);

				console.log(
					'✅ NoiseGenerator node initialized with type:',
					noiseTypeRef.current,
					'wet:',
					wetRef.current
				);
			} catch (error) {
				console.error('❌ Error initializing NoiseGenerator node:', error);
				if (mountedRef.current) {
					setIsInitialized(false);
				}
			}
		};

		setupNoiseGenerator();

		// Cleanup on unmount
		return () => {
			console.log('🧹 Cleaning up NoiseGenerator node');
			mountedRef.current = false;
			if (noiseGeneratorNodeRef.current) {
				noiseGeneratorNodeRef.current.stop();
				noiseGeneratorNodeRef.current.disconnect();
				noiseGeneratorNodeRef.current.dispose();
				noiseGeneratorNodeRef.current = null;
				setIsInitialized(false);
			}
		};
	}, []);

	/**
	 * Start noise playback
	 */
	const startNoise = async () => {
		if (noiseGeneratorNodeRef.current) {
			await noiseGeneratorNodeRef.current.start();
			setIsPlaying(true);
			console.log('▶️ NoiseGenerator started');
		}
	};

	/**
	 * Stop noise playback
	 */
	const stopNoise = async () => {
		if (noiseGeneratorNodeRef.current) {
			await noiseGeneratorNodeRef.current.stop();
			setIsPlaying(false);
			console.log('⏹️ NoiseGenerator stopped');
		}
	};

	/**
	 * Set the noise type
	 */
	const setNoiseType = (value: number) => {
		setNoiseTypeState(value);
		noiseTypeRef.current = value;
		if (noiseGeneratorNodeRef.current) {
			noiseGeneratorNodeRef.current.noiseType.value = value;
			console.log(`🔊 Updated noise type: ${value}`);
		}
	};

	/**
	 * Set the wet/dry mix
	 */
	const setWet = (value: number) => {
		setWetState(value);
		wetRef.current = value;
		if (noiseGeneratorNodeRef.current) {
			noiseGeneratorNodeRef.current.wet = value;
			console.log(`🔊 Updated wet value: ${value}`);
		}
	};

	return {
		noiseGeneratorNode: noiseGeneratorNodeRef.current,
		isInitialized,
		isPlaying,
		noiseType,
		wet,
		setNoiseType,
		setWet,
		startNoise,
		stopNoise,
	};
};
