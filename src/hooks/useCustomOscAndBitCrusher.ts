import { BitCrusherNode } from '../lib/BitCrusherNode';
import { initializeAudio } from '../lib/initializeBitCrusher';
import { createAudioEffectHook } from './createOscNode';

export const useCustomOscAndBitCrusher = createAudioEffectHook({
	name: 'BitCrusher',
	initialize: initializeAudio,
	createEffectNode: () => new BitCrusherNode().toDestination(),
	configureNodes: (oscillator, bitCrusher) => {
		bitCrusher.bits.value = 4;
		// oscillator.output
	},
});
