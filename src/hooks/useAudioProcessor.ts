import { useEffect, useRef, useState } from 'react';

import atanProcessorUrl from '../worklets/audio-processor.ts?url';

interface AudioProcessorState {
	context: AudioContext | null;
	source: AudioBufferSourceNode | null;
	processor: AudioWorkletNode | null;
}

export function useAudioProcessor() {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const [error, setError] = useState<Error | null>(null);
	const audioState = useRef<AudioProcessorState>({
		context: null,
		source: null,
		processor: null,
	});

	async function createWorkletNode(context: BaseAudioContext, name: string, url: string) {
		console.group(`🎵 Creating Worklet Node: ${name}`);
		console.log('Parameters:', {
			contextState: context.state,
			sampleRate: context.sampleRate,
			name,
			url,
		});

		try {
			console.log('Attempting direct node creation...');
			const node = new AudioWorkletNode(context, name);
			console.log('Node created successfully without module loading');
			console.groupEnd();
			return node;
		} catch (err) {
			console.log('Initial creation failed, detailed error:', err);
			console.log('Loading module from URL:', url);

			const startTime = performance.now();
			await context.audioWorklet.addModule(url);
			const loadTime = performance.now() - startTime;

			console.log('Module loading metrics:', {
				duration: `${loadTime.toFixed(2)}ms`,
				timestamp: new Date().toISOString(),
			});

			const node = new AudioWorkletNode(context, name);
			console.log('Node created successfully after module load');
			console.groupEnd();
			return node;
		}
	}

	const initialize = async () => {
		console.group('🎵 Audio Context Initialization');
		try {
			const context = new AudioContext();
			console.log('Audio Context created:', {
				state: context.state,
				sampleRate: context.sampleRate,
				baseLatency: context.baseLatency,
				outputLatency: context.outputLatency,
			});

			const processor = await createWorkletNode(context, 'atan-processor', atanProcessorUrl);

			audioState.current = {
				context,
				processor,
				source: null,
			};

			setIsInitialized(true);
			setError(null);
		} catch (err) {
			console.error('Initialization failed:', err);
			setError(err instanceof Error ? err : new Error('Failed to initialize audio processor'));
		}
		console.groupEnd();
	};

	const processFile = async (file: File) => {
		console.group('🎵 File Processing');
		const startTime = performance.now();

		try {
			const { context, processor } = audioState.current;
			if (!context || !processor) {
				throw new Error('Audio context not initialized');
			}

			console.log('Selected file details:', {
				name: file.name,
				size: `${(file.size / 1024).toFixed(2)} KB`,
				type: file.type,
				lastModified: new Date(file.lastModified).toISOString(),
			});

			console.group('🎵 Audio Decoding');
			console.log('Beginning file decode...');
			const decodeStartTime = performance.now();
			const arrayBuffer = await file.arrayBuffer();
			const buffer = await context.decodeAudioData(arrayBuffer);
			const decodeTime = performance.now() - decodeStartTime;

			console.log('Audio decode metrics:', {
				duration: buffer.duration.toFixed(2) + 's',
				channels: buffer.numberOfChannels,
				sampleRate: buffer.sampleRate,
				decodeTime: decodeTime.toFixed(2) + 'ms',
			});
			console.groupEnd();

			console.group('🎵 Audio Processing Chain Setup');
			console.log('Creating buffer source...');
			const source = context.createBufferSource();
			source.buffer = buffer;

			console.log('Connecting audio chain...');
			source.connect(processor);
			processor.connect(context.destination);

			console.log('Starting playback...');
			source.start(0);

			audioState.current.source = source;
			setIsProcessing(true);
			setError(null);

			const totalSetupTime = performance.now() - startTime;
			console.log('Setup complete:', {
				totalTime: totalSetupTime.toFixed(2) + 'ms',
				timestamp: new Date().toISOString(),
			});
		} catch (err) {
			console.error('Processing failed:', err);
			setError(err instanceof Error ? err : new Error('Failed to process audio file'));
			setIsProcessing(false);
		}
		console.groupEnd();
	};

	const cleanup = () => {
		const { context, source, processor } = audioState.current;
		if (source) {
			source.stop();
			source.disconnect();
		}
		if (processor) {
			processor.disconnect();
		}
		if (context) {
			context.close();
		}
		audioState.current = {
			context: null,
			source: null,
			processor: null,
		};
		setIsInitialized(false);
		setIsProcessing(false);
	};

	useEffect(() => {
		return () => {
			cleanup();
		};
	}, []);

	return {
		isInitialized,
		isProcessing,
		error,
		initialize,
		processFile,
		cleanup,
	};
}
