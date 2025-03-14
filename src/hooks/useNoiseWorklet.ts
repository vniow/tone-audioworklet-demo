import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

import { NoiseNode } from '../lib/NoiseNode'
import { getWorkletGlobalScope } from '../lib/WorkletGlobalScope'
import { workletName } from '../worklets/NoiseProcessor.worklet'

// Options interface for the noise generator hook
export interface NoiseOptions {
	/**
	 * Whether to start noise generation automatically
	 * @default false
	 */
	autostart?: boolean;
}

// Return type for the hook
export interface NoiseHookResult {
	/**
	 * Reference to the noise node instance
	 */
	noiseNode: NoiseNode | null;

	/**
	 * Whether the worklet is initialized
	 */
	isInitialized: boolean;

	/**
	 * Whether the noise generator is currently playing
	 */
	isPlaying: boolean;

	/**
	 * Start the noise generator
	 */
	startNoise: () => void;

	/**
	 * Stop the noise generator
	 */
	stopNoise: () => void;
}

/**
 * A hook to create and manage a Tone.js white noise generator worklet
 *
 * @param options - Configuration options for the noise generator
 * @returns The noise generator control interface
 */
export const useNoiseWorklet = (
	options: NoiseOptions = {}
): NoiseHookResult => {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);

	// Refs to prevent recreation of nodes
	const noiseNodeRef = useRef<NoiseNode | null>(null);
	const mountedRef = useRef(true); // Track if component is mounted

	// Create noise node ONCE on mount
	useEffect(() => {
		mountedRef.current = true;
		console.log('🎛️ Initializing White Noise worklet...');

		const setupNoiseWorklet = async () => {
			try {
				// Initialize audio worklets
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

				// Create a noise node
				const newNoiseNode = new NoiseNode({
					autostart: options.autostart,
				});

				// Update playing state if autostart is enabled
				if (options.autostart) {
					setIsPlaying(true);
				}

				// Store reference
				noiseNodeRef.current = newNoiseNode;
				setIsInitialized(true);

				console.log('✅ White noise node initialized');
			} catch (error) {
				console.error('❌ Error initializing White Noise node:', error);
			}
		};

		setupNoiseWorklet();

		// Cleanup on unmount
		return () => {
			mountedRef.current = false;
			console.log('🧹 Cleaning up White Noise node');
			if (noiseNodeRef.current) {
				noiseNodeRef.current.disconnect();
				noiseNodeRef.current.dispose();
				noiseNodeRef.current = null;
			}
		};
	}, []);

	// Start the noise generator
	const startNoise = async () => {
		if (noiseNodeRef.current && !isPlaying) {
			await Tone.start(); // Ensure audio context is running
			noiseNodeRef.current.start();
			setIsPlaying(true);
			console.log('▶️ White noise generation started');
		}
	};

	// Stop the noise generator
	const stopNoise = () => {
		if (noiseNodeRef.current && isPlaying) {
			noiseNodeRef.current.stop();
			setIsPlaying(false);
			console.log('⏹️ White noise generation stopped');
		}
	};

	return {
		noiseNode: noiseNodeRef.current,
		isInitialized,
		isPlaying,
		startNoise,
		stopNoise,
	};
};
