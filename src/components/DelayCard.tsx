import { useCallback } from 'react'
import * as Tone from 'tone'

import { useAudioNodeConnections } from '../hooks/useAudioNodeConnections'
import { useDelayWorklet } from '../hooks/useDelayWorklet'
import { useGain } from '../hooks/useGain'
import { useOscillator } from '../hooks/useOscillator'
import { EffectCardLayout } from './AudioControls/EffectCardLayout'
import { GainControl } from './AudioControls/GainControl'
import { OscillatorControls } from './AudioControls/OscillatorControls'
import { WetDryControl } from './AudioControls/WetDryControl'

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
		isGainInitialized && isOscInitialized && isDelayInitialized;

	// Use our new hook to handle audio connections
	useAudioNodeConnections([oscillator, gainNode, delayNode], isInitialized);

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
			delayTime,
			feedback,
			wet,
			delayNode,
			gainNode,
			oscillator,
		});
	};

	return (
		<EffectCardLayout
			title='Delay Effect'
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

			{/* Delay section with divider */}
			<div className='pt-3 border-t border-gray-200'>
				<h3 className='font-medium text-xs text-gray-700 mb-2'>Delay Effect</h3>

				{/* Delay Time control */}
				<div className='mb-3'>
					<label className='block text-xs font-medium text-gray-700'>
						Delay Time: {(delayTime * 1000).toFixed(0)}ms
					</label>
					<input
						type='range'
						min='0'
						max='2'
						step='0.01'
						value={delayTime}
						onChange={(e) => setDelayTime(Number(e.target.value))}
						className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
					/>
				</div>

				{/* Feedback control */}
				<div className='mb-3'>
					<label className='block text-xs font-medium text-gray-700'>
						Feedback: {Math.round(feedback * 100)}%
					</label>
					<input
						type='range'
						min='0'
						max='0.99'
						step='0.01'
						value={feedback}
						onChange={(e) => setFeedback(Number(e.target.value))}
						className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
					/>
				</div>

				<WetDryControl
					wet={wet}
					setWet={setWet}
					label='Delay Mix'
				/>
			</div>
		</EffectCardLayout>
	);
};

export default DelayCard;
