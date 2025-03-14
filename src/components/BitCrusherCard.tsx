import { useCallback } from 'react'

import { useBitCrusherWorklet } from '../hooks/useBitCrusherWorklet'
import { useGain } from '../hooks/useGain'
import { AudioEffectCard } from './AudioControls/AudioEffectCard'
import { AudioSourceType } from './AudioControls/AudioSourceProvider'
import { BitCrusherControls } from './AudioControls/BitCrusherControls'
import { GainControl } from './AudioControls/GainControl'

/**
 * BitCrusherCard component that provides a user interface for the bit crusher effect
 *
 * This component combines an oscillator source with a bit crusher effect and
 * volume control in a user-friendly card interface.
 */
const BitCrusherCard = () => {
	// Initialize the bitcrusher worklet
	const {
		bits,
		setBits,
		wet,
		setWet,
		bitCrusherNode,
		isInitialized: isBitCrusherInitialized,
	} = useBitCrusherWorklet({ bits: 4, wet: 0.75 });

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
			bits,
			wet,
			gain: `${gain} (linear)`,
		});
	}, [bits, wet, gain]);

	return (
		<AudioEffectCard
			title='BitCrusher Effect'
			sourceType={AudioSourceType.OSCILLATOR}
			oscillatorOptions={{ frequency: 440, type: 'sine' }}
			effectNodes={[gainNode, bitCrusherNode]}
			effectsInitialized={isGainInitialized && isBitCrusherInitialized}
			onDebug={debugState}
		>
			<GainControl
				gain={gain}
				setGain={setGain}
			/>

			<BitCrusherControls
				bits={bits}
				setBits={setBits}
				wet={wet}
				setWet={setWet}
			/>
		</AudioEffectCard>
	);
};

export default BitCrusherCard;
