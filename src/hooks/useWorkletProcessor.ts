import { useEffect, useRef, useState } from 'react';

interface WorkletProcessorState {
	context: AudioContext | null;
	source: AudioBufferSourceNode | null;
	processor: AudioWorkletNode | null;
	gainNode: GainNode | null;
}

interface WorkletConfig {
	name: string;
	url: string;
	type: 'file' | 'generator';
}

export interface WorkletControls {
	frequency?: number;
	amplitude?: number;
	gain: number;
	[key: string]: number | undefined;
}

export function useWorkletProcessor(config: WorkletConfig) {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isActive, setIsActive] = useState(false);
	const [controls, setControls] = useState<WorkletControls>({
		frequency: 440,
		amplitude: 0.5,
		gain: 1.0,
	});
	const [error, setError] = useState<Error | null>(null);

	const audioState = useRef<WorkletProcessorState>({
		context: null,
		source: null,
		processor: null,
		gainNode: null,
	});

	async function createWorkletNode(context: BaseAudioContext, name: string, url: string) {
		try {
			await context.audioWorklet.addModule(url);

			const node = new AudioWorkletNode(context, name);

			return node;
		} catch (err) {
			console.error('Worklet creation failed:', err);

			throw err;
		}
	}

	const initialize = async () => {
		try {
			const context = new AudioContext();

			const processor = await createWorkletNode(context, config.name, config.url);
			const gainNode = context.createGain();
			gainNode.gain.value = controls.gain;

			// Connect processor -> gain -> destination
			processor.connect(gainNode);
			gainNode.connect(context.destination);

			audioState.current = {
				context,
				processor,
				gainNode,
				source: null,
			};

			setIsInitialized(true);
			setError(null);
		} catch (err) {
			console.error('Initialization failed:', err);
			setError(err instanceof Error ? err : new Error('Failed to initialize worklet processor'));
		}
	};

	const processFile = async (file: File) => {
		if (config.type !== 'file') {
			throw new Error('This worklet is not configured for file processing');
		}

		try {
			const { context, processor, gainNode } = audioState.current;
			if (!context || !processor || !gainNode) {
				throw new Error('Audio context not initialized');
			}

			const arrayBuffer = await file.arrayBuffer();
			const buffer = await context.decodeAudioData(arrayBuffer);

			const source = context.createBufferSource();
			source.buffer = buffer;
			source.connect(processor);

			audioState.current.source = source;
			source.start(0);
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
	};

	const toggleActive = () => {
		if (config.type !== 'generator') {
			throw new Error('This worklet is not configured as a generator');
		}

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
	};

	const updateControl = (name: string, value: number) => {
		if (config.type !== 'generator') {
			throw new Error('This worklet is not configured as a generator');
		}

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
	};

	const updateGain = (value: number) => {
		try {
			const { gainNode } = audioState.current;
			if (!gainNode) {
				throw new Error('Gain node not initialized');
			}

			const safeValue = Math.max(0, Math.min(2, value));
			gainNode.gain.value = safeValue;

			setControls((prev) => ({
				...prev,
				gain: safeValue,
			}));
			setError(null);

			console.log('Gain updated:', {
				requestedValue: value,
				actualValue: safeValue,
			});
		} catch (err) {
			console.error('Gain update failed:', err);
			setError(err instanceof Error ? err : new Error('Failed to update gain'));
		}
	};

	const cleanup = () => {
		const { context, source, processor, gainNode } = audioState.current;
		if (source) {
			source.stop();
			source.disconnect();
		}
		if (processor) {
			processor.disconnect();
		}
		if (gainNode) {
			gainNode.disconnect();
		}
		if (context) {
			context.close();
		}
		audioState.current = {
			context: null,
			source: null,
			processor: null,
			gainNode: null,
		};
		setIsInitialized(false);
		setIsActive(false);
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
		updateGain,
		cleanup,
	};
}
