import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

// Options interface for the oscillator hook
export interface OscillatorOptions {
	frequency?: number;
	type?: Tone.ToneOscillatorType;
	autostart?: boolean;
}

// Return type for the hook
export interface OscillatorHookResult {
	oscillator: Tone.Oscillator | null;
	isInitialized: boolean;
	isPlaying: boolean;
	startOscillator: () => void;
	stopOscillator: () => void;
	setFrequency: (value: number) => void;
	setType: (type: Tone.ToneOscillatorType) => void;
	frequency: number;
	type: Tone.ToneOscillatorType;
}

/**
 * A hook to create and manage a Tone.js oscillator
 *
 * @param options - Configuration options for the oscillator
 * @returns The oscillator control interface
 */
export const useOscillator = (
	options: OscillatorOptions = {}
): OscillatorHookResult => {
	// Default values
	const defaultFrequency = 440;
	const defaultType: Tone.ToneOscillatorType = 'sine';

	// State
	const [isInitialized, setIsInitialized] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [frequency, setFrequencyState] = useState(
		options.frequency !== undefined ? options.frequency : defaultFrequency
	);
	const [type, setTypeState] = useState<Tone.ToneOscillatorType>(
		options.type || defaultType
	);

	// Ref for the oscillator node
	const oscillatorRef = useRef<Tone.Oscillator | null>(null);

	// Create oscillator on mount
	useEffect(() => {
		console.log('🎛️ Initializing oscillator...');

		// Create oscillator with correct constructor arguments
		const osc = new Tone.Oscillator(frequency, type);

		// Store reference
		oscillatorRef.current = osc;
		setIsInitialized(true);

		console.log('✅ Oscillator initialized');

		// Cleanup on unmount
		return () => {
			console.log('🧹 Cleaning up oscillator');
			if (oscillatorRef.current) {
				if (oscillatorRef.current.state === 'started') {
					oscillatorRef.current.stop();
				}
				oscillatorRef.current.disconnect();
				oscillatorRef.current.dispose();
				oscillatorRef.current = null;
			}
		};
	}, []); // Empty dependency array - only run once on mount

	const setFrequency = (newFrequency: number) => {
		setFrequencyState(newFrequency);
		if (oscillatorRef.current) {
			oscillatorRef.current.frequency.value = newFrequency;
			console.log(`🔊 Updated oscillator frequency: ${newFrequency}`);
		}
	};

	const setType = (newType: Tone.ToneOscillatorType) => {
		setTypeState(newType);
		if (oscillatorRef.current) {
			oscillatorRef.current.type = newType;
			console.log(`🔊 Updated oscillator type: ${newType}`);
		}
	};

	// Method to start oscillator
	const startOscillator = async () => {
		if (oscillatorRef.current && !isPlaying) {
			// Ensure audio context is running
			await Tone.start();

			oscillatorRef.current.start();
			setIsPlaying(true);
			console.log('▶️ Oscillator started');
		}
	};

	// Method to stop oscillator
	const stopOscillator = () => {
		if (oscillatorRef.current && isPlaying) {
			oscillatorRef.current.stop();
			setIsPlaying(false);
			console.log('⏹️ Oscillator stopped');
		}
	};

	return {
		oscillator: oscillatorRef.current,
		isInitialized,
		isPlaying,
		startOscillator,
		stopOscillator,
		setFrequency,
		setType,
		frequency,
		type,
	};
};
