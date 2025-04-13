import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

// options interface
export interface OscillatorOptions {
	frequency?: number;
	type?: Tone.ToneOscillatorType;
	autostart?: boolean;
}

// return type for the hook
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
 * hook to create and manage a Tone.js oscillator
 *
 * @param options - configuration options for the oscillator
 * @returns oscillator control interface
 */
export const useOscillator = (
	options: OscillatorOptions = {}
): OscillatorHookResult => {
	const defaultFrequency = 440;
	const defaultType: Tone.ToneOscillatorType = 'sine';

	const [isInitialized, setIsInitialized] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [frequency, setFrequencyState] = useState(
		options.frequency !== undefined ? options.frequency : defaultFrequency
	);
	const [type, setTypeState] = useState<Tone.ToneOscillatorType>(
		options.type || defaultType
	);

	// ref for the oscillator node
	const oscillatorRef = useRef<Tone.Oscillator | null>(null);

	// create oscillator on mount
	useEffect(() => {
		console.log('🎛️ initializing oscillator...');
		const osc = new Tone.Oscillator(frequency, type);
		oscillatorRef.current = osc;
		setIsInitialized(true);

		console.log('✅ oscillator initialized');

		// cleanup on unmount
		return () => {
			console.log('🧹 cleaning up oscillator');
			if (oscillatorRef.current) {
				if (oscillatorRef.current.state === 'started') {
					oscillatorRef.current.stop();
				}
				oscillatorRef.current.disconnect();
				oscillatorRef.current.dispose();
				oscillatorRef.current = null;
			}
		};
	}, []); // empty dependency array - only run once on mount

	const setFrequency = (newFrequency: number) => {
		setFrequencyState(newFrequency);
		if (oscillatorRef.current) {
			oscillatorRef.current.frequency.value = newFrequency;
			console.log(`🔊 updated oscillator frequency: ${newFrequency}`);
		}
	};

	const setType = (newType: Tone.ToneOscillatorType) => {
		setTypeState(newType);
		if (oscillatorRef.current) {
			oscillatorRef.current.type = newType;
			console.log(`🔊 updated oscillator type: ${newType}`);
		}
	};

	// start oscillator
	const startOscillator = async () => {
		if (oscillatorRef.current && !isPlaying) {
			// Ensure audio context is running
			await Tone.start();

			oscillatorRef.current.start();
			setIsPlaying(true);
			console.log('▶️ oscillator started');
		}
	};

	// stop oscillator
	const stopOscillator = () => {
		if (oscillatorRef.current && isPlaying) {
			oscillatorRef.current.stop();
			setIsPlaying(false);
			console.log('⏹️ oscillator stopped');
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
