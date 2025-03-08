import { DelayNode } from '../lib/DelayNode';
import { initializeAudio } from '../lib/initializeDelay';
import { createAudioEffectHook } from './createOscNode';

export const useCustomOscAndDelay = createAudioEffectHook({
	name: 'Delay',
	initialize: initializeAudio,
	createEffectNode: () =>
		new DelayNode({
			delayTime: 0.25,
			feedback: 0.5,
		}).toDestination(),
});
