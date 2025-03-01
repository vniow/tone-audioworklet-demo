import './BitCrusherNode'

import * as Tone from 'tone'

import { workletName } from '../worklets/BitCrusher.worklet'
import { getWorkletGlobalScope } from '../worklets/WorkletGlobalScope'

export async function initializeAudio() {
	// Create AudioContext via Tone.js
	await Tone.start();

	// Register worklets
	const audioWorkletBlob = new Blob([getWorkletGlobalScope()], {
		type: 'text/javascript',
	});
	const workletUrl = URL.createObjectURL(audioWorkletBlob);

	try {
		await Tone.getContext().addAudioWorkletModule(workletUrl);
		console.log(`Successfully registered audio worklets: ${workletName}`);
	} catch (error) {
		console.error('Failed to register audio worklets:', error);
		throw error;
	} finally {
		URL.revokeObjectURL(workletUrl);
	}
}
