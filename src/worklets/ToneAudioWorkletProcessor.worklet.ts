import { addBaseClass } from '../lib/WorkletGlobalScope'

/**
 * Base processor class for Tone.js audio worklets.
 * This implements the basic functionality needed for all Tone.js audio processors.
 */
const toneAudioWorkletProcessor = /* javascript */ `
	/**
	 * Base class for all Tone.js audio worklet processors.
	 * Provides common lifecycle management and access to audio context properties.
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
			 * Flag to track if processor has been disposed
			 * @type {boolean}
			 */
			this.disposed = false;
			
			/**
			 * Size of processing blocks from the audio context
			 * @type {number}
			 * @readonly
			 */
			this.blockSize = 128;
			
			/**
			 * Sample rate from the audio context
			 * @type {number}
			 * @readonly
			 */
			this.sampleRate = sampleRate;
			
			// Set up message handling from main thread
			this.port.onmessage = (event) => {
				if (event.data === "dispose") {
					this.disposed = true;
				} else {
					// Handle other message types in subclasses
					this._onMessage(event);
				}
			};
		}
		
		/**
		 * Handle messages from the main thread
		 * Override in subclasses to handle custom messages
		 * 
		 * @protected
		 * @param {MessageEvent} event - The message event from the main thread
		 */
		_onMessage(event) {
			// Default implementation does nothing
		}
	}
`;

// Add the processor base class to the worklet global scope
addBaseClass(toneAudioWorkletProcessor);
