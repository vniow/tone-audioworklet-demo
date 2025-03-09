import { useEffect, useRef } from 'react'
import * as Tone from 'tone'

import { ToneWorkletBase, ToneWorkletBaseOptions } from '../lib/ToneWorkletBase'

// Define base types for nodes that can be connected
type BaseConnectableNode =
	| Tone.ToneAudioNode
	| ToneWorkletBase<ToneWorkletBaseOptions>
	| AudioNode;
type ConnectableNode = BaseConnectableNode | null;

// Type guard to check if node has toDestination method
function hasToDestination(
	node: ConnectableNode
): node is Tone.ToneAudioNode | ToneWorkletBase<ToneWorkletBaseOptions> {
	return node !== null && 'toDestination' in node;
}

// Type guard for ToneAudioNode or ToneWorkletBase
function isToneNode(
	node: BaseConnectableNode
): node is Tone.ToneAudioNode | ToneWorkletBase<ToneWorkletBaseOptions> {
	return 'connect' in node && !('connect' in AudioNode.prototype);
}

export const useAudioNodeConnections = (
	nodes: ConnectableNode[],
	isInitialized: boolean
) => {
	const nodesConnectedRef = useRef(false);

	useEffect(() => {
		// Check if all nodes exist and are initialized
		const allNodesReady = nodes.every((node) => node !== null) && isInitialized;

		if (allNodesReady && !nodesConnectedRef.current) {
			console.log('🔌 Connecting audio nodes...');

			// Disconnect any existing connections first
			nodes.forEach((node) => {
				if (node) {
					if (node instanceof AudioNode) {
						node.disconnect();
					} else {
						node.disconnect();
					}
				}
			});

			// Connect nodes in sequence
			for (let i = 0; i < nodes.length - 1; i++) {
				const currentNode = nodes[i];
				const nextNode = nodes[i + 1];

				if (currentNode && nextNode) {
					if (isToneNode(currentNode)) {
						// Tone.js or custom worklet node
						currentNode.connect(nextNode);
					} else {
						// Web Audio API node
						currentNode.connect(nextNode as AudioNode);
					}
				}
			}

			// Connect last node to destination
			const lastNode = nodes[nodes.length - 1];
			if (lastNode && hasToDestination(lastNode)) {
				lastNode.toDestination();
			}

			nodesConnectedRef.current = true;
		}

		// Cleanup function
		return () => {
			if (nodesConnectedRef.current) {
				console.log('🧹 Cleaning up audio connections');
				nodes.forEach((node) => {
					if (node) {
						if (node instanceof AudioNode) {
							node.disconnect();
						} else {
							node.disconnect();
						}
					}
				});
				nodesConnectedRef.current = false;
			}
		};
	}, [nodes, isInitialized]);

	return nodesConnectedRef.current;
};
