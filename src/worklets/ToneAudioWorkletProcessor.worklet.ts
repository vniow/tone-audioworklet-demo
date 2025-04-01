import { addBaseClass } from '../lib/WorkletGlobalScope'

/**
 * this provides the base class for all Tone.js compatible audioworklets
 */
const toneAudioWorkletProcessor = /* javascript */ `
	/**
	 * provides common lifecycle management and access to audio context properties
	 * 
	 * @extends AudioWorkletProcessor
	 */
	class ToneAudioWorkletProcessor extends AudioWorkletProcessor {
		/**
		 * @param {Object} options - AudioWorkletProcessor initialization options
		 */
		constructor(options) {
			super(options);
			
			/**
			 * flag to track if processor has been disposed
			 * @type {boolean}
			 */
			this.disposed = false;
			
			/**
			 * size of processing blocks from the audio context
			 * TODO: the size is set at 128 samples for now but it may vary
			 * in the future
			 * @type {number}
			 * @readonly
			 */
			this.blockSize = 128;
			
			/**
			 * sample rate from the audio context
			 * @type {number}
			 * @readonly
			 */
			this.sampleRate = sampleRate;
			
			// set up message handling from main thread
			this.port.onmessage = (event) => {
				if (event.data === "dispose") {
					this.disposed = true;
				} else {
					// handle other message types in subclasses
					this._onMessage(event);
				}
			};
		}
		
		/**
		 * handle messages from the main thread
		 * override in subclasses to handle custom messages
		 * 
		 * @protected
		 * @param {MessageEvent} event - the message event from the main thread
		 */
		_onMessage(event) {
			// default implementation does nada
		}
	}
`;

// add the processor base class to the worklet global scope
addBaseClass(toneAudioWorkletProcessor);
