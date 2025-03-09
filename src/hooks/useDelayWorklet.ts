import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

import { DelayNode } from '../lib/DelayNode'
import { workletName as delayWorklet } from '../worklets/DelayProcessor.worklet'
import { getWorkletGlobalScope } from '../worklets/WorkletGlobalScope'

export interface DelayOptions {
	delayTime?: number; // in seconds
	feedback?: number; // 0-1 range
	wet?: number; // 0-1 range
}

export interface DelayHookResult {
	delayNode: DelayNode | null;
	isInitialized: boolean;
	delayTime: number;
	feedback: number;
	wet: number;
	setDelayTime: (value: number) => void;
	setFeedback: (value: number) => void;
	setWet: (value: number) => void;
}

/**
 * A hook to create and manage a Tone.js DelayNode worklet
 *
 * @param options - Configuration options for the delay node
 * @returns The delay control interface
 */
export const useDelayWorklet = (
	options: DelayOptions = {}
): DelayHookResult => {
	// Default values
	const defaultDelayTime = 0.5; // default delay time in seconds
	const defaultFeedback = 0.5; // default feedback level
	const defaultWet = 1; // fully wet by default

	// State for UI and external tracking
	const [delayTime, setDelayTimeState] = useState(
		options.delayTime !== undefined ? options.delayTime : defaultDelayTime
	);
	const [feedback, setFeedbackState] = useState(
		options.feedback !== undefined ? options.feedback : defaultFeedback
	);
	const [wet, setWetState] = useState(
		options.wet !== undefined ? options.wet : defaultWet
	);
	const [isInitialized, setIsInitialized] = useState(false);

	// Refs to prevent recreation of nodes
	const delayNodeRef = useRef<DelayNode | null>(null);
	const delayTimeRef = useRef(delayTime);
	const feedbackRef = useRef(feedback);
	const wetRef = useRef(wet);
	const mountedRef = useRef(true); // Track if component is mounted

	// Create delay node ONCE on mount
	useEffect(() => {
		mountedRef.current = true;
		console.log('🎛️ Initializing Delay worklet...');

		const setupDelayWorklet = async () => {
			try {
				// Initialize audio worklets
				await Tone.start();

				// Register worklets
				const audioWorkletBlob = new Blob([getWorkletGlobalScope()], {
					type: 'text/javascript',
				});
				const workletUrl = URL.createObjectURL(audioWorkletBlob);

				try {
					await Tone.getContext().addAudioWorkletModule(workletUrl);
					console.log(
						`Successfully registered audio worklets: ${delayWorklet}`
					);
				} catch (error) {
					console.error('Failed to register audio worklets:', error);
					throw error;
				} finally {
					URL.revokeObjectURL(workletUrl);
				}

				// Only continue if component is still mounted
				if (!mountedRef.current) return;

				// Create a delay node
				const newDelayNode = new DelayNode({
					delayTime: delayTimeRef.current,
					feedback: feedbackRef.current,
					wet: wetRef.current,
				});

				// Store reference
				delayNodeRef.current = newDelayNode;
				setIsInitialized(true);

				console.log(
					'✅ Delay node initialized with delay time:',
					delayTimeRef.current,
					'feedback:',
					feedbackRef.current,
					'wet:',
					wetRef.current
				);
			} catch (error) {
				console.error('❌ Error initializing Delay node:', error);
				if (mountedRef.current) {
					setIsInitialized(false);
				}
			}
		};

		setupDelayWorklet();

		// Cleanup on unmount
		return () => {
			console.log('🧹 Cleaning up Delay node');
			mountedRef.current = false;
			if (delayNodeRef.current) {
				delayNodeRef.current.disconnect();
				delayNodeRef.current.dispose();
				delayNodeRef.current = null;
				setIsInitialized(false);
			}
		};
	}, []); // Empty dependency array - only run once on mount

	// Function to set delay time with smoothing
	const setDelayTime = (newDelayTime: number) => {
		setDelayTimeState(newDelayTime);
		delayTimeRef.current = newDelayTime;

		if (delayNodeRef.current) {
			if (typeof delayNodeRef.current.delayTime.rampTo === 'function') {
				delayNodeRef.current.delayTime.rampTo(newDelayTime, 0.05);
			} else {
				delayNodeRef.current.delayTime.value = newDelayTime;
			}
			console.log(`⏱️ Updated delay time: ${newDelayTime}s`);
		}
	};

	// Function to set feedback with smoothing
	const setFeedback = (newFeedback: number) => {
		setFeedbackState(newFeedback);
		feedbackRef.current = newFeedback;

		if (delayNodeRef.current) {
			if (typeof delayNodeRef.current.feedback.rampTo === 'function') {
				delayNodeRef.current.feedback.rampTo(newFeedback, 0.05);
			} else {
				delayNodeRef.current.feedback.value = newFeedback;
			}
			console.log(`🔄 Updated feedback: ${newFeedback}`);
		}
	};

	// Function to set wet/dry mix with smoothing
	const setWet = (newWet: number) => {
		setWetState(newWet);
		wetRef.current = newWet;

		if (delayNodeRef.current) {
			delayNodeRef.current.wet = newWet;
			console.log(`🔊 Updated wet mix: ${newWet}`);
		}
	};

	return {
		delayNode: delayNodeRef.current,
		isInitialized,
		delayTime,
		feedback,
		wet,
		setDelayTime,
		setFeedback,
		setWet,
	};
};
