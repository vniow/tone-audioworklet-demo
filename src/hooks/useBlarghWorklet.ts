import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

import { useAudioStore } from '../stores/audioStore';
import { BlarghWorkletWrapper } from '../utils/BlarghWorkletWrapper';
import blarghWorklet from '../worklets/blargh-worklet.ts?url';

interface NoiseControls {
	frequency: number;
}

export function useBlarghWorklet() {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [controls, setControls] = useState<NoiseControls>({
		frequency: 440,
	});
	const [gainValue, setGainValue] = useState(0.25);
	const [error, setError] = useState<Error | null>(null);

	const blarghNode = useRef<BlarghWorkletWrapper | null>(null);
	const gainNode = useRef<Tone.Gain | null>(null);
	const { initializeContext } = useAudioStore();

	const initialize = async () => {
		try {
			await initializeContext();

			const node = new BlarghWorkletWrapper({
				workletUrl: blarghWorklet,
				processorName: 'blargh-worklet',
			});
			gainNode.current = new Tone.Gain(gainValue);

			// Chain nodes
			node.chain(gainNode.current.toDestination());
			blarghNode.current = node;
			setIsInitialized(true);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to initialize worklet'));
		}
	};

	const togglePlayback = async () => {
		try {
			const node = blarghNode.current;
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
			const node = blarghNode.current;
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
			const node = blarghNode.current;
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
		if (blarghNode.current) {
			blarghNode.current.dispose();
			blarghNode.current = null;
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
