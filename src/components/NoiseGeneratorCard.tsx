import { useCallback } from 'react'
import * as Tone from 'tone'

import { useAudioNodeConnections } from '../hooks/useAudioNodeConnections'
import { useGain } from '../hooks/useGain'
import { useNoiseWorklet } from '../hooks/useNoiseWorklet'
import { EffectCardLayout } from './AudioControls/EffectCardLayout'
import { GainControl } from './AudioControls/GainControl'
import { NoiseTypeControl } from './AudioControls/NoiseTypeControl'
import { WetDryControl } from './AudioControls/WetDryControl'

const NoiseGeneratorCard = () => {
	// Initialize the noise generator worklet
	const {
		noiseGeneratorNode,
		isInitialized: isNoiseInitialized,
		isPlaying,
		noiseType,
		wet,
		setNoiseType,
		setWet,
		startNoise,
		stopNoise,
	} = useNoiseWorklet({ noiseType: 0, wet: 0.75 });

	// Initialize the gain node for output volume control
	const {
		gain,
		setGain,
		gainNode,
		isInitialized: isGainInitialized,
	} = useGain({ gain: 0.5 });

	// Overall initialization state
	const isInitialized = isNoiseInitialized && isGainInitialized;

	// Connect nodes in the audio graph
	useAudioNodeConnections([noiseGeneratorNode, gainNode], isInitialized);

	// Toggle noise playback
	const togglePlayback = useCallback(async () => {
		await Tone.start();
		if (isPlaying) {
			await stopNoise();
		} else {
			await startNoise();
		}
	}, [isPlaying, startNoise, stopNoise]);

	// Debug state helper
	const debugState = () => {
		console.log('🔍 Debug State:', {
			isPlaying,
			isInitialized,
			noiseType,
			wet,
			gain: `${gain} (linear)`,
			context: Tone.getContext().state,
			noiseGeneratorNode,
			gainNode,
		});
	};

	return (
		<EffectCardLayout
			title='Noise Generator'
			isInitialized={isInitialized}
			isPlaying={isPlaying}
			onPlay={togglePlayback}
			onDebug={debugState}
		>
			{/* Noise type selector */}
			<div className='mb-3'>
				<NoiseTypeControl
					noiseType={noiseType}
					setNoiseType={setNoiseType}
				/>
			</div>

			{/* Output volume control */}
			<GainControl
				gain={gain}
				setGain={setGain}
			/>

			{/* Wet/dry mix control */}
			<WetDryControl
				wet={wet}
				setWet={setWet}
				label='Noise Volume'
			/>
		</EffectCardLayout>
	);
};

export default NoiseGeneratorCard;
