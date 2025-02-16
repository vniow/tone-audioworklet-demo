import { useEffect, useRef, useState } from 'react';

import { CustomToneWrapper } from '../utils/CustomToneWrapper';

type NoiseType = 'white' | 'brown' | 'pink';

export function useCustomTone() {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [noiseType, setNoiseType] = useState<NoiseType>('white');
	const [gainValue, setGainValue] = useState(1);
	const [error, setError] = useState<Error | null>(null);

	const toneNode = useRef<CustomToneWrapper | null>(null);

	const initialize = async () => {
		try {
			const node = new CustomToneWrapper({
				noiseType,
				gain: gainValue,
			});

			// Connect to destination (master output)
			node.toDestination();

			toneNode.current = node;
			setIsInitialized(true);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to initialize custom tone node'));
		}
	};

	const togglePlayback = async () => {
		try {
			const node = toneNode.current;
			if (!node) {
				throw new Error('Custom tone node not initialized');
			}

			await node.toggle();
			setIsPlaying(node.isPlaying);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to toggle playback'));
		}
	};

	const updateNoiseType = (type: NoiseType) => {
		try {
			const node = toneNode.current;
			if (!node) {
				throw new Error('Custom tone node not initialized');
			}

			node.noiseType = type;
			setNoiseType(type);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to update noise type'));
		}
	};

	const updateGain = (value: number) => {
		try {
			const node = toneNode.current;
			if (!node) {
				throw new Error('Custom tone node not initialized');
			}

			node.gain = value;
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
