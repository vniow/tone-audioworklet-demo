import { ReactNode } from 'react'
import * as Tone from 'tone'

import { useNoiseWorklet } from '../../hooks/useNoiseWorklet'
import { useOscillator } from '../../hooks/useOscillator'
import { OscillatorControls } from './OscillatorControls'

/**
 * TODO: I don't like that both noise and oscillator are in the same source type. feel there's a better way to do this. how does Tone do it anyway
 */

export enum AudioSourceType {
	OSCILLATOR = 'oscillator',
	NOISE = 'noise',
}

/**
 * props
 */
interface AudioSourceProviderProps {
	/**
	 * audio source type. see this doesn't seem right to me. ok so Tone does have a whole source class. can i extend it? is that necessary?
	 */
	sourceType: AudioSourceType;

	/**
	 * set the initial parameters for the oscillator
	 */
	oscillatorOptions?: {
		frequency: number;
		type: Tone.ToneOscillatorType;
	};

	/**
	 * set the initial parameters for the noise generator
	 */
	noiseOptions?: {
		autostart?: boolean;
		// noiseType?: NoiseType;
	};

	/**
	 * render prop to return the children with the current state of the audio source
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
 * AudioSourceProvider component to manage audio source state and provide controls
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

	// init noise if needed
	const {
		noiseNode,
		isPlaying: isNoisePlaying,
		startNoise,
		stopNoise,
		isInitialized: isNoiseInitialized,
	} = useNoiseWorklet(noiseOptions);

	// what source are we using
	const sourceNode =
		sourceType === AudioSourceType.OSCILLATOR ? oscillator : noiseNode;
	const isPlaying =
		sourceType === AudioSourceType.OSCILLATOR ? isOscPlaying : isNoisePlaying;
	const isInitialized =
		sourceType === AudioSourceType.OSCILLATOR
			? isOscInitialized
			: isNoiseInitialized;

	// toggle playback function to start or stop the audio source
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

	// render appropriate controls based on source type
	const controlsComponent =
		sourceType === AudioSourceType.OSCILLATOR ? (
			<OscillatorControls
				frequency={frequency}
				type={type}
				setFrequency={setFrequency}
				setType={setType}
			/>
		) : null;

	//
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
