import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

type NoiseType = 'white' | 'brown' | 'pink';

interface ToneState {
	noise: Tone.Noise | null;
	gain: Tone.Gain | null;
}

export function useTone() {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [noiseType, setNoiseType] = useState<NoiseType>('white');
	const [gainValue, setGainValue] = useState(0.5);
	const [error, setError] = useState<Error | null>(null);

	const toneState = useRef<ToneState>({
		noise: null,
		gain: null,
	});

	const initialize = async () => {
		try {
			await Tone.start();
			const gain = new Tone.Gain(gainValue);
			const noise = new Tone.Noise({
				type: noiseType,
				volume: -10,
			});

			noise.connect(gain);
			gain.toDestination();

			toneState.current = {
				noise,
				gain,
			};

			setIsInitialized(true);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to initialize Tone.js'));
		}
	};

	const togglePlayback = () => {
		try {
			const { noise } = toneState.current;
			if (!noise) {
				throw new Error('Tone.js not initialized');
			}

			if (isPlaying) {
				noise.stop();
			} else {
				noise.start();
			}

			setIsPlaying(!isPlaying);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to toggle playback'));
		}
	};

	const updateNoiseType = (type: NoiseType) => {
		try {
			const { noise } = toneState.current;
			if (!noise) {
				throw new Error('Tone.js not initialized');
			}

			const wasPlaying = isPlaying;
			if (wasPlaying) {
				noise.stop();
			}

			noise.type = type;
			setNoiseType(type);

			if (wasPlaying) {
				noise.start();
			}

			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to update noise type'));
		}
	};

	const updateGain = (value: number) => {
		try {
			const { gain } = toneState.current;
			if (!gain) {
				throw new Error('Tone.js not initialized');
			}

			const safeValue = Math.max(0, Math.min(2, value));
			gain.gain.value = safeValue;
			setGainValue(safeValue);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to update gain'));
		}
	};

	const cleanup = () => {
		const { noise, gain } = toneState.current;

		if (noise) {
			noise.stop().dispose();
		}
		if (gain) {
			gain.dispose();
		}

		toneState.current = {
			noise: null,
			gain: null,
		};

		setIsInitialized(false);
		setIsPlaying(false);
	};

	useEffect(() => {
		return () => {
			cleanup();
		};
	}, []);

	return {
		isInitialized,
		isPlaying,
		noiseType,
		gainValue,
		error,
		initialize,
		togglePlayback,
		updateNoiseType,
		updateGain,
	};
}
