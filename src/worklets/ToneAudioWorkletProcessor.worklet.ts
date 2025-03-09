import { addToWorklet } from '../lib/WorkletGlobalScope'

const toneAudioWorkletProcessor = /* javascript */ `
	
	class ToneAudioWorkletProcessor extends AudioWorkletProcessor {

		constructor(options) {
			
			super(options);
			this.disposed = false;
			this.blockSize = 128;
			this.sampleRate = sampleRate;
			this.port.onmessage = (event) => {
				if (event.data === "dispose") {
					this.disposed = true;
				}
			};
		}
	}
`;

addToWorklet(toneAudioWorkletProcessor);
