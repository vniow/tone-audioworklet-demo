import { ReactNode, useState } from 'react'
import * as Tone from 'tone'

import { AudioSourceProvider, AudioSourceType } from './AudioSourceProvider'
import { EffectCardLayout } from './EffectCardLayout'
import { EffectChain } from './EffectChain'

/**
 * Props for the AudioEffectCard component
 */
interface AudioEffectCardProps {
	/**
	 * Title of the effect card
	 */
	title: string;

	/**
	 * Type of audio source to use
	 */
	sourceType: AudioSourceType;

	/**
	 * Initial configuration for oscillator if using oscillator source
	 */
	oscillatorOptions?: {
		frequency: number;
		type: Tone.ToneOscillatorType;
	};

	/**
	 * Initial configuration for noise generator if using noise source
	 */
	noiseOptions?: {
		autostart?: boolean;
		noiseType?: import('../../worklets/NoiseProcessor.worklet').NoiseType;
	};

	/**
	 * Array of effect nodes to include in the chain (after the source)
	 */
	effectNodes: (Tone.ToneAudioNode | null)[];

	/**
	 * Whether all effect nodes are properly initialized
	 */
	effectsInitialized: boolean;

	/**
	 * Custom debug function to output additional state information
	 */
	onDebug?: () => void;

	/**
	 * Child components to render (typically effect controls)
	 */
	children: ReactNode;
}

/**
 * A comprehensive card component for audio effects
 *
 * This component combines an audio source with a chain of effects,
 * providing a consistent interface for playback control and parameter adjustment.
 */
export const AudioEffectCard = ({
	title,
	sourceType,
	oscillatorOptions,
	noiseOptions,
	effectNodes,
	effectsInitialized,
	onDebug,
	children,
}: AudioEffectCardProps) => {
	// Debug state storage
	const [debugState, setDebugState] = useState<Record<string, any>>({});

	return (
		<AudioSourceProvider
			sourceType={sourceType}
			oscillatorOptions={oscillatorOptions}
			noiseOptions={noiseOptions}
		>
			{({
				sourceNode,
				isPlaying,
				isInitialized: sourceInitialized,
				togglePlayback,
				controlsComponent,
			}) => {
				// Combine source node with effect nodes
				const allNodes = sourceNode
					? [sourceNode, ...effectNodes]
					: effectNodes;

				// Check if everything is initialized
				const isInitialized = sourceInitialized && effectsInitialized;

				// Default debug function
				const handleDebug = () => {
					const currentState = {
						isPlaying,
						isInitialized,
						context: Tone.getContext().state,
						sourceNode,
						effectNodes,
					};

					setDebugState(currentState);
					console.log('🔍 Debug State:', currentState);

					// Call custom debug if provided
					if (onDebug) onDebug();
				};

				return (
					<EffectChain
						nodes={allNodes}
						isInitialized={isInitialized}
					>
						<EffectCardLayout
							title={title}
							isInitialized={isInitialized}
							isPlaying={isPlaying}
							onPlay={togglePlayback}
							onDebug={handleDebug}
						>
							{/* Source controls */}
							{controlsComponent}

							{/* Effect-specific controls */}
							{children}
						</EffectCardLayout>
					</EffectChain>
				);
			}}
		</AudioSourceProvider>
	);
};
