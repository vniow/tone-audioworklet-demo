import { useCallback } from 'react'
import * as Tone from 'tone'

import { useAudioNodeConnections } from '../hooks/useAudioNodeConnections'
import { useGain } from '../hooks/useGain'
import { useNoiseWorklet } from '../hooks/useNoiseWorklet'
import { EffectCardLayout } from './AudioControls/EffectCardLayout'
import { GainControl } from './AudioControls/GainControl'

/**
 * component wraps the white noise generator worklet with a volume control
 */
const NoiseCard = () => {
	// initialize the white noise generator worklet
	const {
		startNoise,
		stopNoise,
		noiseNode,
		isInitialized: isNoiseInitialized,
		isPlaying,
	} = useNoiseWorklet();

	// initialize the gain node for volume control
	const {
		gain,
		setGain,
		gainNode,
		isInitialized: isGainInitialized,
	} = useGain({ gain: 0.25 });

	// overall initialization state
	const isInitialized = isNoiseInitialized && isGainInitialized;

	// use our hook to handle audio connections
	useAudioNodeConnections([noiseNode, gainNode], isInitialized);

	// toggle noise playback
	const togglePlayback = useCallback(async () => {
		await Tone.start();
		if (isPlaying) {
			stopNoise();
		} else {
			startNoise();
		}
	}, [isPlaying, startNoise, stopNoise]);

	// debug state helper
	const debugState = () => {
		console.log('🔍 Debug State:', {
			isPlaying,
			isInitialized,
			gain: `${gain} (linear)`,
			context: Tone.getContext().state,
			noiseNode,
			gainNode,
		});
	};

	return (
		<EffectCardLayout
			title='White Noise Generator'
			isInitialized={isInitialized}
			isPlaying={isPlaying}
			onPlay={togglePlayback}
			onDebug={debugState}
		>
			{/* volume control using gain */}
			<GainControl
				gain={gain}
				setGain={setGain}
				label='Volume'
			/>
		</EffectCardLayout>
	);
};

export default NoiseCard;
