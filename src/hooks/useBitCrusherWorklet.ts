import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

import { BitCrusherNode } from '../lib/BitCrusherNode'
import { workletName } from '../worklets/BitCrusher.worklet'
import { getWorkletGlobalScope } from '../worklets/WorkletGlobalScope'

// Options interface for the bit crusher hook
export interface BitCrusherOptions {
	bits?: number; // 1-16 range
	wet?: number; // 0-1 range
}

// Return type for the hook
export interface BitCrusherHookResult {
	bitCrusherNode: BitCrusherNode | null;
	isInitialized: boolean;
	bits: number;
	wet: number;
	setBits: (value: number) => void;
	setWet: (value: number) => void;
}

/**
 * A hook to create and manage a Tone.js BitCrusherNode worklet
 *
 * @param options - Configuration options for the bit crusher node
 * @returns The bit crusher control interface
 */
export const useBitCrusherWorklet = (
	options: BitCrusherOptions = {}
): BitCrusherHookResult => {
	// Default values
	const defaultBits = 4;
	const defaultWet = 1; // fully wet by default

	// State for UI and external tracking
	const [bits, setBitsState] = useState(
		options.bits !== undefined ? options.bits : defaultBits
	);
	const [wet, setWetState] = useState(
		options.wet !== undefined ? options.wet : defaultWet
	);
	const [isInitialized, setIsInitialized] = useState(false);

	// Refs to prevent recreation of nodes
	const bitCrusherNodeRef = useRef<BitCrusherNode | null>(null);
	// ref to track the current bits value
	const bitsRef = useRef(bits);
	// Ref to track the current wet value for smoothing
	const wetRef = useRef(wet);

	// Create bit crusher node ONCE on mount
	useEffect(() => {
		// Skip if already initialized
		if (isInitialized) return;

		console.log('🎛️ Initializing BitCrusher worklet...');

		const setupBitCrusher = async () => {
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

				// Create a bit crusher node
				const newBitCrusherNode = new BitCrusherNode({
					bits: bitsRef.current,
					wet: wetRef.current,
				});

				// Store reference
				bitCrusherNodeRef.current = newBitCrusherNode;
				setIsInitialized(true);

				console.log(
					'✅ BitCrusher node initialized with bits:',
					bits,
					'wet:',
					wet
				);
			} catch (error) {
				console.error('❌ Error initializing BitCrusher node:', error);
			}
		};

		setupBitCrusher();

		// Cleanup on unmount
		return () => {
			console.log('🧹 Cleaning up BitCrusher node');
			if (bitCrusherNodeRef.current) {
				bitCrusherNodeRef.current.disconnect();
				bitCrusherNodeRef.current.dispose();
				bitCrusherNodeRef.current = null;
			}
		};
	}, []);

	// Function to set bits value
	const setBits = (newBits: number) => {
		setBitsState(newBits);
		bitsRef.current = newBits;

		if (bitCrusherNodeRef.current) {
			if (typeof bitCrusherNodeRef.current.bits.rampTo === 'function') {
				bitCrusherNodeRef.current.bits.rampTo(newBits, 0.05);
			} else {
				bitCrusherNodeRef.current.bits.value = newBits;
			}
			console.log(`🔊 Updated bits value: ${newBits}`);
		}
	};

	// Function to set wet/dry mix with smoothing
	const setWet = (newWet: number) => {
		setWetState(newWet);
		wetRef.current = newWet;

		if (bitCrusherNodeRef.current) {
			bitCrusherNodeRef.current.wet = newWet;
			console.log(`🔊 Updated wet value: ${newWet}`);
		}
	};

	return {
		bitCrusherNode: bitCrusherNodeRef.current,
		isInitialized,
		bits,
		wet,
		setBits,
		setWet,
	};
};
