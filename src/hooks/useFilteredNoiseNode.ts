import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

import { FilteredNoiseNode } from '../audio/FilteredNoiseNode'

export function useFilteredNoiseNode() {
	const [isInitialized, setIsInitialized] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [cutoff, setCutoff] = useState(1000);
	const [q, setQ] = useState(1.0);
	const [error, setError] = useState<Error | null>(null);

	const node = useRef<FilteredNoiseNode | null>(null);

	const initialize = async () => {
		try {
			// Ensure Tone.js is started first
			await Tone.start();

			if (!node.current) {
				node.current = new FilteredNoiseNode();
			}
			await node.current.initialize();
			node.current.toDestination();
			setIsInitialized(true);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to initialize filtered noise node'));
		}
	};

	const togglePlayback = () => {
		try {
			const filteredNode = node.current;
			if (!filteredNode?.initialized) {
				throw new Error('Node not initialized');
			}

			if (isPlaying) {
				filteredNode.stop();
				setIsPlaying(false);
			} else {
				filteredNode.start();
				setIsPlaying(true);
			}
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to toggle playback'));
		}
	};

	const updateCutoff = (frequency: number) => {
		try {
			if (node.current?.initialized) {
				node.current.setCutoff(frequency);
				setCutoff(frequency);
			}
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to update cutoff'));
		}
	};

	const updateQ = (value: number) => {
		try {
			if (node.current?.initialized) {
				node.current.setQ(value);
				setQ(value);
			}
		} catch (err) {
			setError(err instanceof Error ? err : new Error('Failed to update Q'));
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
		cutoff,
		q,
		error,
		initialize,
		togglePlayback,
		updateCutoff,
		updateQ,
	};
}
