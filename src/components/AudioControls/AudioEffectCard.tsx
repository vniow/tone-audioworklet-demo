import { ReactNode, useState } from 'react'
import * as Tone from 'tone'

import { AudioSourceProvider, AudioSourceType } from './AudioSourceProvider'
import { EffectCardLayout } from './EffectCardLayout'
import { EffectChain } from './EffectChain'

interface AudioEffectCardProps {
	title: string;

	/**
	 * TODO: I don't like that both noise and oscillator are in the same source type. feel there's a better way to do this
	 */
	sourceType: AudioSourceType;

	/**
	 * initial oscillator configuration
	 */
	oscillatorOptions?: {
		frequency: number;
		type: Tone.ToneOscillatorType;
	};

	/**
	 * initial noise configuration
	 */
	noiseOptions?: {
		autostart?: boolean;
	};

	/**
	 * array of effect nodes to chain after the source
	 */
	effectNodes: (Tone.ToneAudioNode | null)[];

	/**
	 * boolean to indicate if the effect nodes are initialized
	 */
	effectsInitialized: boolean;

	/**
	 * debug function to log the current state of the audio graph
	 */
	onDebug?: () => void;

	/**
	 * child components for additional controls or information
	 */
	children: ReactNode;
}

/**
 * a card like component to display an audio source with various effects
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
	// track debug state to log the current state of the audio graph
	const [, setDebugState] = useState<Record<string, unknown>>({});

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
				// combine source and effect nodes into a single array
				const allNodes = sourceNode
					? [sourceNode, ...effectNodes]
					: effectNodes;

				// check initialization state of source and effect nodes
				const isInitialized = sourceInitialized && effectsInitialized;

				// debug me
				const handleDebug = () => {
					const currentState = {
						isPlaying,
						isInitialized,
						context: Tone.getContext().state,
						sourceNode,
						effectNodes,
					};

					setDebugState(currentState);
					console.log('🔍 debug state:', currentState);
					// call the onDebug function if provided
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
							{/* source controls */}
							{controlsComponent}

							{/* effect-specific controls */}
							{children}
						</EffectCardLayout>
					</EffectChain>
				);
			}}
		</AudioSourceProvider>
	);
};
