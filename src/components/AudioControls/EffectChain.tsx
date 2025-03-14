import { ReactNode, useMemo } from 'react'
import * as Tone from 'tone'

import { useAudioNodeConnections } from '../../hooks/useAudioNodeConnections'

/**
 * Props for the EffectChain component
 */
interface EffectChainProps {
	/**
	 * Array of audio nodes to connect in sequence
	 */
	nodes: (Tone.ToneAudioNode | null)[];

	/**
	 * Whether all nodes are properly initialized
	 */
	isInitialized: boolean;

	/**
	 * Children components to render
	 */
	children: ReactNode;
}

/**
 * Component that manages connections between audio nodes in a chain
 *
 * This component handles the routing of audio signals between a sequence
 * of audio nodes, ensuring they are properly connected and disconnected.
 */
export const EffectChain = ({
	nodes,
	isInitialized,
	children,
}: EffectChainProps) => {
	// Filter out any null nodes
	const validNodes = useMemo(
		() => nodes.filter((node): node is Tone.ToneAudioNode => node !== null),
		[nodes]
	);

	// Use our hook to handle audio connections
	useAudioNodeConnections(validNodes, isInitialized);

	return <>{children}</>;
};
