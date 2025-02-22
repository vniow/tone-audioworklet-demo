import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

export function useOscillator() {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [gainValue, setGainValue] = useState(0.25);
	const [error, setError] = useState<Error | null>(null);

	const oscillator = useRef<Tone.Oscillator | null>(null);
	const gainNode = useRef<Tone.Gain | null>(null);
	const context = Tone.getContext();
	console.log('context', context);

	const initialize = async () => {
		try {
			await Tone.start();
			oscillator.current = new Tone.Oscillator({
				type: 'sine',
				frequency: 440,
			});
			gainNode.current = new Tone.Gain(gainValue);

			oscillator.current.connect(gainNode.current);
			gainNode.current.toDestination();
			setIsInitialized(true);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to initialize oscillator'));
		}
	};

	const togglePlayback = async () => {
		try {
			const osc = oscillator.current;
			if (!osc) {
				throw new Error('Oscillator not initialized');
			}

			if (osc.state === 'started') {
				osc.stop();
				setIsPlaying(false);
			} else {
				osc.start();
				setIsPlaying(true);
			}
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to toggle playback'));
		}
	};

	const updateGain = (value: number) => {
		try {
			const gain = gainNode.current;
			if (!gain) {
				throw new Error('Gain node not initialized');
			}
			gain.gain.value = value;
			setGainValue(value);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to update gain'));
		}
	};

	const cleanup = () => {
		if (oscillator.current) {
			oscillator.current.stop();
			oscillator.current.dispose();
			oscillator.current = null;
		}
		if (gainNode.current) {
			gainNode.current.dispose();
			gainNode.current = null;
		}
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
		gainValue,
		error,
		initialize,
		togglePlayback,
		updateGain,
	};
}
