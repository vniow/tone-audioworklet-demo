import { useEffect, useRef, useState } from 'react';

interface WorkletProcessorState {
	context: AudioContext | null;
	source: AudioBufferSourceNode | null;
	processor: AudioWorkletNode | null;
}

interface WorkletConfig {
	name: string;
	url: string;
	type: 'file' | 'generator';
}

export interface WorkletControls {
	frequency?: number;
	amplitude?: number;
	[key: string]: number | undefined;
}

export function useWorkletProcessor(config: WorkletConfig) {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isActive, setIsActive] = useState(false);
	const [controls, setControls] = useState<WorkletControls>({
		frequency: 440,
		amplitude: 0.5,
	});
	const [error, setError] = useState<Error | null>(null);

	const audioState = useRef<WorkletProcessorState>({
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
			console.log('Loading module from URL:', url);
			await context.audioWorklet.addModule(url);

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
		console.group('🎵 Worklet Processor Initialization');
		try {
			const context = new AudioContext();
			console.log('Audio Context created:', {
				state: context.state,
				sampleRate: context.sampleRate,
				baseLatency: context.baseLatency,
				outputLatency: context.outputLatency,
			});

			const processor = await createWorkletNode(context, config.name, config.url);
			processor.connect(context.destination);

			audioState.current = {
				context,
				processor,
				source: null,
			};

			setIsInitialized(true);
			setError(null);
			console.log('Initialization complete');
		} catch (err) {
			console.error('Initialization failed:', err);
			setError(err instanceof Error ? err : new Error('Failed to initialize worklet processor'));
		}
		console.groupEnd();
	};

	const processFile = async (file: File) => {
		if (config.type !== 'file') {
			throw new Error('This worklet is not configured for file processing');
		}

		console.group('🎵 File Processing');

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

			const arrayBuffer = await file.arrayBuffer();
			const buffer = await context.decodeAudioData(arrayBuffer);

			const source = context.createBufferSource();
			source.buffer = buffer;
			source.connect(processor);
			source.start(0);

			audioState.current.source = source;
			setIsActive(true);
			setError(null);

			source.onended = () => {
				setIsActive(false);
			};
		} catch (err) {
			console.error('Processing failed:', err);
			setError(err instanceof Error ? err : new Error('Failed to process audio file'));
			setIsActive(false);
		}
		console.groupEnd();
	};

	const toggleActive = () => {
		if (config.type !== 'generator') {
			throw new Error('This worklet is not configured as a generator');
		}

		console.group('🎵 Generator Toggle');
		try {
			const { processor } = audioState.current;
			if (!processor) {
				throw new Error('Processor not initialized');
			}

			const newState = !isActive;
			processor.port.postMessage({
				type: 'toggle',
				active: newState,
			});

			setIsActive(newState);
			setError(null);
		} catch (err) {
			console.error('Toggle failed:', err);
			setError(err instanceof Error ? err : new Error('Failed to toggle processor'));
		}
		console.groupEnd();
	};

	const updateControl = (name: string, value: number) => {
		if (config.type !== 'generator') {
			throw new Error('This worklet is not configured as a generator');
		}

		console.group(`🎵 Updating ${name}`);
		try {
			const { processor } = audioState.current;
			if (!processor) {
				throw new Error('Processor not initialized');
			}

			processor.port.postMessage({
				type: name,
				value,
			});

			setControls((prev) => ({
				...prev,
				[name]: value,
			}));
			setError(null);
		} catch (err) {
			console.error(`${name} update failed:`, err);
			setError(err instanceof Error ? err : new Error(`Failed to update ${name}`));
		}
		console.groupEnd();
	};

	const cleanup = () => {
		console.group('🎵 Worklet Processor Cleanup');
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
		setIsActive(false);
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
		isActive,
		controls,
		error,
		initialize,
		processFile: config.type === 'file' ? processFile : undefined,
		toggleActive: config.type === 'generator' ? toggleActive : undefined,
		updateControl: config.type === 'generator' ? updateControl : undefined,
		cleanup,
	};
}
