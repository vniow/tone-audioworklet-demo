import './ToneAudioWorkletProcessor.worklet'

import { addBaseClass } from '../lib/WorkletGlobalScope'

/**
 * Single Input/Output processor base class for implementing sample-by-sample audio processors.
 * This provides a simplified interface where implementations only need to implement a generate() method.
 */
export const singleIOProcess = /* javascript */ `
	/**
	 * Abstract class for a single input/output processor.
	 * Provides a simplified interface for processing audio one sample at a time.
	 * 
	 * @extends ToneAudioWorkletProcessor
	 * 
	 * @typedef {Object} ProcessorParams - All parameters accessible in the generate method
	 * @property {Object.<string, number>} params - Runtime parameter values
	 */
	class SingleIOProcessor extends ToneAudioWorkletProcessor {
		/**
		 * @param {Object} options - AudioWorkletProcessor initialization options
		 */
		constructor(options) {
			super(Object.assign({}, options, {
				numberOfInputs: 1,
				numberOfOutputs: 1
			}));
			
			/**
			 * Parameters are updated on each sample
			 * @type {Object.<string, number>}
			 * @protected
			 */
			this.params = {};
			
			/**
			 * Cache for audio processing optimization
			 * @type {Float32Array[]}
			 * @protected
			 */
			this._paramCache = null;
		}
		
		/**
		 * Generate a single sample of audio output
		 * Override this method in subclasses to implement audio processing.
		 * 
		 * @param {number} input - Input sample value
		 * @param {number} channel - Channel index
		 * @param {Object.<string, number>} params - Parameter values
		 * @returns {number} Output sample
		 */
		generate(input, channel, params) {
			// Override in subclass - default is pass-through
			return input;
		}

		/**
		 * Update parameter values for the current sample
		 * 
		 * @param {Object.<string, Float32Array>} parameters - Raw parameter arrays
		 * @param {number} index - Current sample index
		 */
		updateParams(parameters, index) {
			for (const paramName in parameters) {
				const param = parameters[paramName];
				if (param.length > 1) {
					this.params[paramName] = parameters[paramName][index];
				} else {
					this.params[paramName] = parameters[paramName][0];
				}
			}
		}

		/**
		 * Process audio data
		 * This method handles copying input to output with the generate function.
		 * 
		 * @param {Float32Array[][]} inputs - Input audio data
		 * @param {Float32Array[][]} outputs - Output audio buffers to fill
		 * @param {Object.<string, Float32Array>} parameters - AudioWorklet parameters
		 * @returns {boolean} Keep alive flag
		 */
		process(inputs, outputs, parameters) {
			const input = inputs[0];
			const output = outputs[0];
			
			// Determine channel count from available inputs/outputs
			const channelCount = Math.max(input && input.length || 0, output.length);
			
			// Process each sample
			for (let sample = 0; sample < this.blockSize; sample++) {
				// Update parameter values for this sample
				this.updateParams(parameters, sample);
				
				// Process each channel
				for (let channel = 0; channel < channelCount; channel++) {
					// Get input sample (or 0 if no input)
					const inputSample = input && input.length ? input[channel][sample] : 0;
					
					// Generate output sample
					output[channel][sample] = this.generate(inputSample, channel, this.params);
				}
			}
			
			// Keep processor alive unless disposed
			return !this.disposed;
		}
	};
`;

addBaseClass(singleIOProcess);
