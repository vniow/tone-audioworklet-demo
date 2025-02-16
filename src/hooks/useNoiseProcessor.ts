import { useEffect, useRef, useState } from 'react';

import noiseWorkletUrl from '../worklets/noise-worklet.ts?url';

interface NoiseProcessorState {
	context: AudioContext | null;
	processor: AudioWorkletNode | null;
}

export function useNoiseProcessor() {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [frequency, setFrequency] = useState(440);
	const [amplitude, setAmplitude] = useState(0.5);
	const [error, setError] = useState<Error | null>(null);
	const audioState = useRef<NoiseProcessorState>({
		context: null,
		processor: null,
	});

	async function createWorkletNode(context: BaseAudioContext, name: string, url: string) {
		console.group(`🎵 Creating Noise Worklet Node: ${name}`);
		console.log('Parameters:', {
			contextState: context.state,
			sampleRate: context.sampleRate,
			name,
			url,
		});

		try {
			console.log('Loading module from URL:', url);
			const startTime = performance.now();
			await context.audioWorklet.addModule(url);
			const loadTime = performance.now() - startTime;

			console.log('Module loading metrics:', {
				duration: `${loadTime.toFixed(2)}ms`,
				timestamp: new Date().toISOString(),
			});

			const node = new AudioWorkletNode(context, name);
			console.log('Node created successfully');
			console.groupEnd();
			return node;
		} catch (err) {
			console.error('Worklet creation failed:', err);
			console.groupEnd();
			throw err;
		}
	}

	const initialize = async () => {
		console.group('🎵 Noise Processor Initialization');
		try {
			const context = new AudioContext();
			console.log('Audio Context created:', {
				state: context.state,
				sampleRate: context.sampleRate,
				baseLatency: context.baseLatency,
				outputLatency: context.outputLatency,
			});

			const processor = await createWorkletNode(context, 'noise-worklet', noiseWorkletUrl);
			processor.connect(context.destination);

			audioState.current = {
				context,
				processor,
			};

			setIsInitialized(true);
			setError(null);
			console.log('Initialization complete');
		} catch (err) {
			console.error('Initialization failed:', err);
			setError(err instanceof Error ? err : new Error('Failed to initialize noise processor'));
		}
		console.groupEnd();
	};

	const togglePlayback = () => {
		console.group('🎵 Noise Processor Playback Toggle');
		try {
			const { processor } = audioState.current;
			if (!processor) {
				throw new Error('Processor not initialized');
			}

			const newState = !isPlaying;
			console.log('Toggling playback:', { newState });

			processor.port.postMessage({
				type: 'toggle',
				active: newState,
			});

			setIsPlaying(newState);
			setError(null);
		} catch (err) {
			console.error('Playback toggle failed:', err);
			setError(err instanceof Error ? err : new Error('Failed to toggle playback'));
		}
		console.groupEnd();
	};

	const updateFrequency = (value: number) => {
		console.group('🎵 Noise Processor Frequency Update');
		try {
			const { processor } = audioState.current;
			if (!processor) {
				throw new Error('Processor not initialized');
			}

			console.log('Updating frequency:', {
				current: frequency,
				new: value,
			});

			processor.port.postMessage({
				type: 'frequency',
				value,
			});

			setFrequency(value);
			setError(null);
		} catch (err) {
			console.error('Frequency update failed:', err);
			setError(err instanceof Error ? err : new Error('Failed to update frequency'));
		}
		console.groupEnd();
	};

	const updateAmplitude = (value: number) => {
		console.group('🎵 Noise Processor Amplitude Update');
		try {
			const { processor } = audioState.current;
			if (!processor) {
				throw new Error('Processor not initialized');
			}

			console.log('Updating amplitude:', {
				current: amplitude,
				new: value,
			});

			processor.port.postMessage({
				type: 'amplitude',
				value,
			});

			setAmplitude(value);
			setError(null);
		} catch (err) {
			console.error('Amplitude update failed:', err);
			setError(err instanceof Error ? err : new Error('Failed to update amplitude'));
		}
		console.groupEnd();
	};

	const cleanup = () => {
		console.group('🎵 Noise Processor Cleanup');
		const { context, processor } = audioState.current;
		if (processor) {
			console.log('Disconnecting processor');
			processor.disconnect();
		}
		if (context) {
			console.log('Closing audio context');
			context.close();
		}
		audioState.current = {
			context: null,
			processor: null,
		};
		setIsInitialized(false);
		setIsPlaying(false);
		console.log('Cleanup complete');
		console.groupEnd();
	};

	useEffect(() => {
		return () => {
			cleanup();
		};
	}, []);

	return {
		isInitialized,
		isPlaying,
		frequency,
		amplitude,
		error,
		initialize,
		togglePlayback,
		updateFrequency,
		updateAmplitude,
		cleanup,
	};
}
