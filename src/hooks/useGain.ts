import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

// options interface for the gain hook
export interface GainOptions {
	gain?: Tone.Unit.NormalRange; // 0-1 range
}

// return type for the hook
export interface GainHookResult {
	gain: Tone.Unit.NormalRange;
	setGain: (value: Tone.Unit.NormalRange) => void;
	gainNode: Tone.Gain | null;
	isInitialized: boolean;
}

/**
 * hook to create and manage a Tone.js gain node
 *
 * @param options - config options for the gain node
 * @returns gain node control interface
 */
export const useGain = (options: GainOptions = {}): GainHookResult => {
	// default values
	const defaultGain = 0.25;

	// state for UI and external tracking
	const [gain, setGainState] = useState(
		options.gain !== undefined ? options.gain : defaultGain
	);
	const [isInitialized, setIsInitialized] = useState(false);

	// refs to prevent recreation of nodes
	const gainNodeRef = useRef<Tone.Gain | null>(null);
	const gainValueRef = useRef(gain);

	// create gain node once on mount
	useEffect(() => {
		console.log('🎛️ initializing gain node...');

		// create a gain node
		const newGainNode = new Tone.Gain(gainValueRef.current);

		// store reference
		gainNodeRef.current = newGainNode;
		setIsInitialized(true);

		console.log('✅ gain node initialized with value:', gainValueRef.current);

		// cleanup on unmount
		return () => {
			console.log('🧹 Cleaning up gain node');
			if (gainNodeRef.current) {
				gainNodeRef.current.disconnect();
				gainNodeRef.current.dispose();
				gainNodeRef.current = null;
			}
		};
	}, []); // empty dependency array - only run once on mount

	// custom setGain function that updates both state and node directly
	const setGain = (newGain: Tone.Unit.NormalRange) => {
		// update ref
		gainValueRef.current = newGain;
		const gainValueRampTo = 0.05;
		if (gainNodeRef.current) {
			if (typeof gainNodeRef.current.gain.rampTo === 'function') {
				gainNodeRef.current.gain.rampTo(newGain, gainValueRampTo);
				console.log(
					`🔊 ramped to gain value: ${newGain} over ${gainValueRampTo} seconds`
				);
			} else {
				gainNodeRef.current.gain.value = newGain;
				console.log(`🔊 set gain value: ${newGain}`);
			}
		}

		// update UI state
		setGainState(newGain);
	};

	return {
		gainNode: gainNodeRef.current,
		gain,
		setGain,
		isInitialized,
	};
};
