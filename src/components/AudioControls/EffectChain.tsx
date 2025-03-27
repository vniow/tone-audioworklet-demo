import { ReactNode, useMemo } from 'react'
import * as Tone from 'tone'

import { useAudioNodeConnections } from '../../hooks/useAudioNodeConnections'

/**
 * props
 */
interface EffectChainProps {
	/**
	 * array of audio nodes to connect in a chain
	 */
	nodes: (Tone.ToneAudioNode | null)[];

	/**
	 * are the audio nodes initialized
	 */
	isInitialized: boolean;

	/**
	 * what goes inside the chain
	 */
	children: ReactNode;
}

/**
 * this component provides a way to chain together audio nodes
 */
export const EffectChain = ({
	nodes,
	isInitialized,
	children,
}: EffectChainProps) => {
	// filter out any null nodes
	const validNodes = useMemo(
		() => nodes.filter((node): node is Tone.ToneAudioNode => node !== null),
		[nodes]
	);

	// use our hook to handle audio connections
	useAudioNodeConnections(validNodes, isInitialized);

	return <>{children}</>;
};
