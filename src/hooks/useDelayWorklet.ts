import { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'

import { DelayNode } from '../lib/DelayNode'
import { getWorkletGlobalScope } from '../lib/WorkletGlobalScope'
import { workletName as delayWorklet } from '../worklets/DelayProcessor.worklet'

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
 * hook to create and manage a custom delay worklet
 *
 * @param options - config options for the delay node
 * @returns delay control interface
 */
export const useDelayWorklet = (
	options: DelayOptions = {}
): DelayHookResult => {
	// Default values
	const defaultDelayTime = 0.5; // default delay time in seconds
	const defaultFeedback = 0.5; // default feedback level
	const defaultWet = 1; // fully moist by default

	// state for UI and external tracking
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

	// refs to prevent recreation of nodes
	const delayNodeRef = useRef<DelayNode | null>(null);
	const delayTimeRef = useRef(delayTime);
	const feedbackRef = useRef(feedback);
	const wetRef = useRef(wet);
	const mountedRef = useRef(true); // track if component is mounted

	// create delay node once on mount
	useEffect(() => {
		mountedRef.current = true;
		console.log('🎛️ initializing delay worklet...');

		const setupDelayWorklet = async () => {
			try {
				// initialize audio worklets
				await Tone.start();

				// register worklets
				const audioWorkletBlob = new Blob([getWorkletGlobalScope()], {
					type: 'text/javascript',
				});
				const workletUrl = URL.createObjectURL(audioWorkletBlob);

				try {
					await Tone.getContext().addAudioWorkletModule(workletUrl);
					console.log(
						`successfully registered audio worklets: ${delayWorklet}`
					);
				} catch (error) {
					console.error('failed to register audio worklets:', error);
					throw error;
				} finally {
					URL.revokeObjectURL(workletUrl);
				}

				// only continue if component is still mounted
				if (!mountedRef.current) return;

				// create a delay node
				const newDelayNode = new DelayNode({
					delayTime: delayTimeRef.current,
					feedback: feedbackRef.current,
					wet: wetRef.current,
				});

				// store reference
				delayNodeRef.current = newDelayNode;
				setIsInitialized(true);

				console.log(
					'✅ delay node initialized with delay time:',
					delayTimeRef.current,
					'feedback:',
					feedbackRef.current,
					'wet:',
					wetRef.current
				);
			} catch (error) {
				console.error('❌ error initializing delay node:', error);
				if (mountedRef.current) {
					setIsInitialized(false);
				}
			}
		};

		setupDelayWorklet();

		// cleanup on unmount
		return () => {
			console.log('🧹 cleaning up delay node');
			mountedRef.current = false;
			if (delayNodeRef.current) {
				delayNodeRef.current.disconnect();
				delayNodeRef.current.dispose();
				delayNodeRef.current = null;
				setIsInitialized(false);
			}
		};
	}, []); // empty dependency array - only run once on mount

	// function to set delay time with smoothing
	const setDelayTime = (newDelayTime: number) => {
		setDelayTimeState(newDelayTime);
		delayTimeRef.current = newDelayTime;

		if (delayNodeRef.current) {
			if (typeof delayNodeRef.current.delayTime.rampTo === 'function') {
				delayNodeRef.current.delayTime.rampTo(newDelayTime, 0.05);
			} else {
				delayNodeRef.current.delayTime.value = newDelayTime;
			}
			console.log(`⏱️ updated delay time: ${newDelayTime}s`);
		}
	};

	// function to set feedback with smoothing
	const setFeedback = (newFeedback: number) => {
		setFeedbackState(newFeedback);
		feedbackRef.current = newFeedback;

		if (delayNodeRef.current) {
			if (typeof delayNodeRef.current.feedback.rampTo === 'function') {
				delayNodeRef.current.feedback.rampTo(newFeedback, 0.05);
			} else {
				delayNodeRef.current.feedback.value = newFeedback;
			}
			console.log(`🔄 updated feedback: ${newFeedback}`);
		}
	};

	// function to set wet/dry mix with smoothing
	const setWet = (newWet: number) => {
		setWetState(newWet);
		wetRef.current = newWet;

		if (delayNodeRef.current) {
			
			delayNodeRef.current.wet = newWet;
			console.log(`🔊 updated wet mix: ${newWet}`);
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
