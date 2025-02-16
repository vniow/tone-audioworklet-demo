import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

import { ToneWorkletWrapper } from '../utils/ToneWorkletWrapper';
import noiseWorkletUrl from '../worklets/noise-worklet.ts?url';

interface NoiseControls {
	frequency: number;
	amplitude: number;
}

export function useToneWorklet() {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [controls, setControls] = useState<NoiseControls>({
		frequency: 440,
		amplitude: 0.5,
	});
	const [gainValue, setGainValue] = useState(0.5);
	const [error, setError] = useState<Error | null>(null);

	const toneNode = useRef<ToneWorkletWrapper | null>(null);
	const gainNode = useRef<Tone.Gain | null>(null);

	const initialize = async () => {
		try {
			const node = new ToneWorkletWrapper({
				workletUrl: noiseWorkletUrl,
				processorName: 'noise-worklet',
			});
			gainNode.current = new Tone.Gain(gainValue);

			// Chain nodes
			node.chain(gainNode.current.toDestination());
			toneNode.current = node;
			setIsInitialized(true);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to initialize worklet'));
		}
	};

	const togglePlayback = async () => {
		try {
			const node = toneNode.current;
			if (!node) {
				throw new Error('Worklet not initialized');
			}

			await node.toggle();
			setIsPlaying(node.isPlaying);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to toggle playback'));
		}
	};

	const updateFrequency = (value: number) => {
		try {
			const node = toneNode.current;
			if (!node) {
				throw new Error('Worklet not initialized');
			}

			node.setParam('frequency', value);
			setControls((prev) => ({ ...prev, frequency: value }));
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to update frequency'));
		}
	};

	const updateAmplitude = (value: number) => {
		try {
			const node = toneNode.current;
			if (!node) {
				throw new Error('Worklet not initialized');
			}

			node.setParam('amplitude', value);
			setControls((prev) => ({ ...prev, amplitude: value }));
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to update amplitude'));
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
		if (toneNode.current) {
			toneNode.current.dispose();
			toneNode.current = null;
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
		controls,
		gainValue,
		error,
		initialize,
		togglePlayback,
		updateFrequency,
		updateAmplitude,
		updateGain,
	};
}
