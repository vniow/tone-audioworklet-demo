import { useCallback } from 'react'
import * as Tone from 'tone'

import { useAudioNodeConnections } from '../hooks/useAudioNodeConnections'
import { useBitCrusherWorklet } from '../hooks/useBitCrusherWorklet'
import { useGain } from '../hooks/useGain'
import { useOscillator } from '../hooks/useOscillator'
import { EffectCardLayout } from './AudioControls/EffectCardLayout'
import { GainControl } from './AudioControls/GainControl'
import { OscillatorControls } from './AudioControls/OscillatorControls'
import { WetDryControl } from './AudioControls/WetDryControl'

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

	// Initialize the oscillator
	const {
		oscillator,
		isPlaying,
		startOscillator,
		stopOscillator,
		setFrequency,
		setType,
		frequency,
		type,
		isInitialized: isOscInitialized,
	} = useOscillator({ frequency: 440, type: 'sine' });

	// Overall initialization state
	const isInitialized =
		isGainInitialized && isOscInitialized && isBitCrusherInitialized;

	// Use our new hook to handle audio connections
	useAudioNodeConnections(
		[oscillator, gainNode, bitCrusherNode],
		isInitialized
	);

	// Toggle oscillator playback
	const togglePlayback = useCallback(async () => {
		await Tone.start();
		if (isPlaying) {
			stopOscillator();
		} else {
			startOscillator();
		}
	}, [isPlaying, startOscillator, stopOscillator]);

	// Debug state helper
	const debugState = () => {
		console.log('🔍 Debug State:', {
			isPlaying,
			isInitialized,
			frequency,
			type,
			gain: `${gain} (linear)`,
			context: Tone.getContext().state,
			bits,
			wet,
			bitCrusherNode,
			gainNode,
			oscillator,
		});
	};

	return (
		<EffectCardLayout
			title='BitCrusher Effect'
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

			{/* BitCrusher section with divider */}
			<div className='pt-3 border-t border-gray-200'>
				<h3 className='font-medium text-xs text-gray-700 mb-2'>
					BitCrusher Effect
				</h3>

				{/* Bit depth control */}
				<div className='mb-3'>
					<label className='block text-xs font-medium text-gray-700'>
						Bit Depth: {bits} bits
					</label>
					<input
						type='range'
						min='1'
						max='16'
						step='1'
						value={bits}
						onChange={(e) => setBits(Number(e.target.value))}
						className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
					/>
				</div>

				<WetDryControl
					wet={wet}
					setWet={setWet}
					label='BitCrusher Mix'
				/>
			</div>
		</EffectCardLayout>
	);
};

export default BitCrusherCard;
