import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

import { CustomToneNode } from '../audio/CustomToneNode'

export function useCustomNode() {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const node = useRef<CustomToneNode | null>(null);

	const initialize = async () => {
		try {
			// Ensure Tone.js is started first
			await Tone.start();

			if (!node.current) {
				node.current = new CustomToneNode();
			}
			await node.current.initialize();
			node.current.toDestination();
			setIsInitialized(true);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to initialize custom node'));
		}
	};

	const togglePlayback = () => {
		try {
			const customNode = node.current;
			if (!customNode?.initialized) {
				throw new Error('Node not initialized');
			}

			if (isPlaying) {
				customNode.stop();
				setIsPlaying(false);
			} else {
				customNode.start();
				setIsPlaying(true);
			}
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to toggle playback'));
		}
	};

	const cleanup = () => {
		if (node.current) {
			node.current.dispose();
			node.current = null;
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
		error,
		initialize,
		togglePlayback,
	};
}
