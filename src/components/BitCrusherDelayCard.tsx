import { useCallback } from 'react'

import { useBitCrusherWorklet } from '../hooks/useBitCrusherWorklet'
import { useDelayWorklet } from '../hooks/useDelayWorklet'
import { useGain } from '../hooks/useGain'
import { AudioEffectCard } from './AudioControls/AudioEffectCard'
import { AudioSourceType } from './AudioControls/AudioSourceProvider'
import { BitCrusherControls } from './AudioControls/BitCrusherControls'
import { DelayControls } from './AudioControls/DelayControls'
import { GainControl } from './AudioControls/GainControl'

/**
 * BitCrusherDelayCard component that provides a user interface for a combined effect chain
 *
 * This component chains an oscillator through both BitCrusher and Delay effects
 * with independent controls for each effect in the chain.
 */
const BitCrusherDelayCard = () => {
	// Initialize the delay worklet
	const {
		delayTime,
		setDelayTime,
		feedback,
		setFeedback,
		wet: delayWet,
		setWet: setDelayWet,
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

	// Initialize the bitcrusher worklet
	const {
		bits,
		setBits,
		wet: crusherWet,
		setWet: setCrusherWet,
		bitCrusherNode,
		isInitialized: isBitCrusherInitialized,
	} = useBitCrusherWorklet({
		bits: 4,
		wet: 0.75,
	});

	// Custom debug function to include effect-specific state
	const debugState = useCallback(() => {
		console.log('Additional Debug Info:', {
			delayTime,
			feedback,
			delayWet,
			bits,
			crusherWet,
			gain: `${gain} (linear)`,
		});
	}, [delayTime, feedback, delayWet, bits, crusherWet, gain]);

	return (
		<AudioEffectCard
			title='BitCrusher + Delay Effect'
			sourceType={AudioSourceType.OSCILLATOR}
			oscillatorOptions={{ frequency: 440, type: 'sine' }}
			effectNodes={[gainNode, bitCrusherNode, delayNode]}
			effectsInitialized={
				isGainInitialized && isBitCrusherInitialized && isDelayInitialized
			}
			onDebug={debugState}
		>
			<GainControl
				gain={gain}
				setGain={setGain}
			/>

			<BitCrusherControls
				bits={bits}
				setBits={setBits}
				wet={crusherWet}
				setWet={setCrusherWet}
			/>

			<DelayControls
				delayTime={delayTime}
				setDelayTime={setDelayTime}
				feedback={feedback}
				setFeedback={setFeedback}
				wet={delayWet}
				setWet={setDelayWet}
			/>
		</AudioEffectCard>
	);
};

export default BitCrusherDelayCard;
