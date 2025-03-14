import { useCallback } from 'react'

import { useDelayWorklet } from '../hooks/useDelayWorklet'
import { useGain } from '../hooks/useGain'
import { AudioEffectCard } from './AudioControls/AudioEffectCard'
import { AudioSourceType } from './AudioControls/AudioSourceProvider'
import { DelayControls } from './AudioControls/DelayControls'
import { GainControl } from './AudioControls/GainControl'

/**
 * DelayCard component that provides a user interface for the delay effect
 *
 * This component combines an oscillator source with a delay effect and
 * volume control in a user-friendly card interface.
 */
const DelayCard = () => {
	// Initialize the delay worklet
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

	// Initialize the gain node
	const {
		gain,
		setGain,
		gainNode,
		isInitialized: isGainInitialized,
	} = useGain({ gain: 0.25 });

	// Custom debug function to include effect-specific state
	const debugState = useCallback(() => {
		console.log('Additional Debug Info:', {
			delayTime,
			feedback,
			wet,
			gain: `${gain} (linear)`,
		});
	}, [delayTime, feedback, wet, gain]);

	return (
		<AudioEffectCard
			title='Delay Effect'
			sourceType={AudioSourceType.OSCILLATOR}
			oscillatorOptions={{ frequency: 440, type: 'sine' }}
			effectNodes={[gainNode, delayNode]}
			effectsInitialized={isGainInitialized && isDelayInitialized}
			onDebug={debugState}
		>
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
		</AudioEffectCard>
	);
};

export default DelayCard;
