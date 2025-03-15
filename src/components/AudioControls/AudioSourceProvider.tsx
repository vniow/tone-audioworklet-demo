import { ReactNode } from 'react'
import * as Tone from 'tone'

import { useNoiseWorklet } from '../../hooks/useNoiseWorklet'
import { useOscillator } from '../../hooks/useOscillator'
import { OscillatorControls } from './OscillatorControls'

/**
 * Types of audio sources supported
 */
export enum AudioSourceType {
	OSCILLATOR = 'oscillator',
	NOISE = 'noise',
}

/**
 * Props for the AudioSourceProvider component
 */
interface AudioSourceProviderProps {
	/**
	 * Type of audio source to use
	 */
	sourceType: AudioSourceType;

	/**
	 * Initial parameters for the oscillator (when sourceType is OSCILLATOR)
	 */
	oscillatorOptions?: {
		frequency: number;
		type: Tone.ToneOscillatorType;
	};

	/**
	 * Initial parameters for the noise generator (when sourceType is NOISE)
	 */
	noiseOptions?: {
		autostart?: boolean;
		// noiseType?: NoiseType;
	};

	/**
	 * Render prop function that receives source controls and state
	 */
	children: (props: {
		sourceNode: Tone.ToneAudioNode | null;
		isPlaying: boolean;
		isInitialized: boolean;
		togglePlayback: () => Promise<void>;
		controlsComponent: ReactNode;
	}) => ReactNode;
}

/**
 * Component that provides a unified interface for different audio sources
 *
 * This component abstracts the differences between various audio sources (oscillator, noise)
 * and provides a consistent interface for controlling them.
 */
export const AudioSourceProvider = ({
	sourceType,
	oscillatorOptions = { frequency: 440, type: 'sine' },
	noiseOptions = { autostart: false },
	children,
}: AudioSourceProviderProps) => {
	// Initialize oscillator if needed
	const {
		oscillator,
		isPlaying: isOscPlaying,
		startOscillator,
		stopOscillator,
		setFrequency,
		setType,
		frequency,
		type,
		isInitialized: isOscInitialized,
	} = useOscillator(oscillatorOptions);

	// Initialize noise generator if needed
	const {
		noiseNode,
		isPlaying: isNoisePlaying,
		startNoise,
		stopNoise,
		isInitialized: isNoiseInitialized,
	} = useNoiseWorklet(noiseOptions);

	// Determine which source is active based on sourceType
	const sourceNode =
		sourceType === AudioSourceType.OSCILLATOR ? oscillator : noiseNode;
	const isPlaying =
		sourceType === AudioSourceType.OSCILLATOR ? isOscPlaying : isNoisePlaying;
	const isInitialized =
		sourceType === AudioSourceType.OSCILLATOR
			? isOscInitialized
			: isNoiseInitialized;

	// Toggle playback for the active source
	const togglePlayback = async () => {
		await Tone.start();

		if (sourceType === AudioSourceType.OSCILLATOR) {
			if (isOscPlaying) {
				stopOscillator();
			} else {
				startOscillator();
			}
		} else {
			if (isNoisePlaying) {
				stopNoise();
			} else {
				startNoise();
			}
		}
	};

	// Render the appropriate controls for the selected source type
	const controlsComponent =
		sourceType === AudioSourceType.OSCILLATOR ? (
			<OscillatorControls
				frequency={frequency}
				type={type}
				setFrequency={setFrequency}
				setType={setType}
			/>
		) : null;

	// Use the render prop pattern to pass all necessary data to children
	return (
		<>
			{children({
				sourceNode,
				isPlaying,
				isInitialized,
				togglePlayback,
				controlsComponent,
			})}
		</>
	);
};
