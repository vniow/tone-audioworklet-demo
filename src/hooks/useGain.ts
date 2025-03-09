import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

// Options interface for the gain hook
export interface GainOptions {
	gain?: number; // 0-1 range
}

// Return type for the hook
export interface GainHookResult {
	gain: number;
	setGain: (value: number) => void;
	gainNode: Tone.Gain | null;
	isInitialized: boolean;
}

/**
 * A hook to create and manage a Tone.js gain node
 *
 * @param options - Configuration options for the gain node
 * @returns The gain node control interface
 */
export const useGain = (options: GainOptions = {}): GainHookResult => {
	// Default values
	const defaultGain = 0.25;

	// State for UI and external tracking
	const [gain, setGainState] = useState(options.gain !== undefined ? options.gain : defaultGain);
	const [isInitialized, setIsInitialized] = useState(false);

	// Refs to prevent recreation of nodes
	const gainNodeRef = useRef<Tone.Gain | null>(null);
	const gainValueRef = useRef(gain);

	// Create gain node ONCE on mount
	useEffect(() => {
		console.log('🎛️ Initializing gain node...');

		// Create a gain node that outputs to the main destination
		const newGainNode = new Tone.Gain(gainValueRef.current);

		// Store reference
		gainNodeRef.current = newGainNode;
		setIsInitialized(true);

		console.log('✅ Gain node initialized with value:', gainValueRef.current);

		// Cleanup on unmount
		return () => {
			console.log('🧹 Cleaning up gain node');
			if (gainNodeRef.current) {
				gainNodeRef.current.disconnect();
				gainNodeRef.current.dispose();
				gainNodeRef.current = null;
			}
		};
	}, []); // Empty dependency array - only run once on mount

	// Custom setGain function that updates both state and node directly
	const setGain = (newGain: number) => {
		// Update ref
		gainValueRef.current = newGain;

		// Update UI state
		setGainState(newGain);

		// Update actual node parameter directly if it exists
		if (gainNodeRef.current) {
			gainNodeRef.current.gain.value = newGain;
			console.log(`🔊 Updated gain value: ${newGain}`);
		}
	};

	return {
		gain,
		setGain,
		gainNode: gainNodeRef.current,
		isInitialized,
	};
};
