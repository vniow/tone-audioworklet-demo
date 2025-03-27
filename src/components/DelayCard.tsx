import { useCallback } from 'react'
import * as Tone from 'tone'

import { useDelayWorklet } from '../hooks/useDelayWorklet'
import { useGain } from '../hooks/useGain'
import { useOscillator } from '../hooks/useOscillator'
import { DelayControls } from './AudioControls/DelayControls'
import { EffectCardLayout } from './AudioControls/EffectCardLayout'
import { GainControl } from './AudioControls/GainControl'
import { OscillatorControls } from './AudioControls/OscillatorControls'

/**
 * component combines an oscillator source with a delay effect and
 * volume control
 */
const DelayCard = () => {
	// Initialize oscillator
	const {
		oscillator,
		isPlaying,
		startOscillator,
		stopOscillator,
		setFrequency,
		setType,
		frequency,
		type,
		isInitialized: isOscillatorInitialized,
	} = useOscillator({ frequency: 440, type: 'sine' });

	// initialize the delay worklet
	const {
		delayTime,
		setDelayTime,
		feedback,
		setFeedback,
		wet,
		setWet,
		delayNode,
		isInitialized: isDelayInitialized,
	} = useDelayWorklet({
		delayTime: 0.5,
		feedback: 0.5,
		wet: 0.75,
	});

	// initialize the gain node
	const {
		gain,
		setGain,
		gainNode,
		isInitialized: isGainInitialized,
	} = useGain({ gain: 0.25 });

	// Overall initialization state
	const isInitialized = isOscillatorInitialized && isDelayInitialized && isGainInitialized;

	// Connect audio nodes when all are initialized
	if (oscillator && delayNode && gainNode) {
		oscillator.connect(delayNode);
		delayNode.connect(gainNode);
		gainNode.toDestination();
	}

	// Toggle playback function
	const togglePlayback = useCallback(async () => {
		await Tone.start();
		if (isPlaying) {
			stopOscillator();
		} else {
			startOscillator();
		}
	}, [isPlaying, startOscillator, stopOscillator]);

	// debug function to include effect-specific state
	const debugState = useCallback(() => {
		console.log('debug state:', {
			isPlaying,
			isInitialized,
			frequency,
			oscillatorType: type,
			delayTime,
			feedback,
			wet,
			gain: `${gain} (linear)`,
			context: Tone.getContext().state,
		});
	}, [delayTime, feedback, wet, gain, frequency, type, isPlaying, isInitialized]);

	return (
		<EffectCardLayout
			title='delay effect'
			isInitialized={isInitialized}
			isPlaying={isPlaying}
			onPlay={togglePlayback}
			onDebug={debugState}
		>
			<OscillatorControls
				frequency={frequency}
				type={type}
				setFrequency={setFrequency}
				setType={setType}
			/>

			<GainControl
				gain={gain}
				setGain={setGain}
			/>

			<DelayControls
				delayTime={delayTime}
				setDelayTime={setDelayTime}
				feedback={feedback}
				setFeedback={setFeedback}
				wet={wet}
				setWet={setWet}
			/>
		</EffectCardLayout>
	);
};

export default DelayCard;
