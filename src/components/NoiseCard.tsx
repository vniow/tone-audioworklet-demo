import { useCallback } from 'react'
import * as Tone from 'tone'

import { useAudioNodeConnections } from '../hooks/useAudioNodeConnections'
import { useGain } from '../hooks/useGain'
import { useNoiseWorklet } from '../hooks/useNoiseWorklet'
import { EffectCardLayout } from './AudioControls/EffectCardLayout'
import { GainControl } from './AudioControls/GainControl'

/**
 * NoiseCard component that provides a user interface for the white noise generator
 *
 * This component wraps the white noise generator worklet in a user-friendly card
 * with a volume control via GainNode.
 */
const NoiseCard = () => {
	// Initialize the white noise generator worklet
	const {
		startNoise,
		stopNoise,
		noiseNode,
		isInitialized: isNoiseInitialized,
		isPlaying,
	} = useNoiseWorklet();

	// Initialize the gain node for volume control
	const {
		gain,
		setGain,
		gainNode,
		isInitialized: isGainInitialized,
	} = useGain({ gain: 0.25 });

	// Overall initialization state
	const isInitialized = isNoiseInitialized && isGainInitialized;

	// Use our hook to handle audio connections
	useAudioNodeConnections([noiseNode, gainNode], isInitialized);

	// Toggle noise playback
	const togglePlayback = useCallback(async () => {
		await Tone.start();
		if (isPlaying) {
			stopNoise();
		} else {
			startNoise();
		}
	}, [isPlaying, startNoise, stopNoise]);

	// Debug state helper
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
			{/* Volume control using Gain */}
			<GainControl
				gain={gain}
				setGain={setGain}
				label='Volume'
			/>
		</EffectCardLayout>
	);
};

export default NoiseCard;
