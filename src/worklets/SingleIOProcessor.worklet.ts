import "./ToneAudioWorkletProcessor.worklet";

import { addBaseClass } from "../lib/WorkletGlobalScope";

/**
 * single input/output processor for AudioWorklet for worklets
 * that process audio one sample at a time
 */
export const singleIOProcess = /* javascript */ `
	/**
	 * abstract class for a single input/output processor
	 * provides a simplified interface for processing audio one sample at a time
	 * 
	 * @extends ToneAudioWorkletProcessor
	 * 
	 * @typedef {Object} ProcessorParams - all parameters accessible in the generate method
	 * @property {Object.<string, number>} params - runtime parameter values
	 */
	class SingleIOProcessor extends ToneAudioWorkletProcessor {
		/**
		 * @param {Object} options - AudioWorkletProcessor init options
		 */
		constructor(options) {
			super(Object.assign({}, options, {
				numberOfInputs: 1,
				numberOfOutputs: 1
			}));
			
			/**
			 * parameters are updated on each sample
			 * @type {Object.<string, number>}
			 * @protected
			 */
			this.params = {};
			
			/**
			 * cache for audio processing optimization
			 * @type {Float32Array[]}
			 * @protected
			 */
			this._paramCache = null;
		}
		
		/**
		 * generate a single sample of audio output
		 * override this method in subclasses to implement audio processing.
		 * 
		 * @param {number} input - input sample value
		 * @param {number} channel - channel index
		 * @param {Object.<string, number>} params - parameter values
		 * @returns {number} output sample
		 */
		generate(input, channel, params) {
			// override in subclass - default is pass-through
			return input;
		}

		/**
		 * update parameter values for the current sample
		 * 
		 * @param {Object.<string, Float32Array>} parameters - raw parameter arrays
		 * @param {number} index - current sample index
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
		 * process audio data
		 * handles copying input to output with the generate function
		 * 
		 * @param {Float32Array[][]} inputs - input audio data
		 * @param {Float32Array[][]} outputs - output audio buffers to fill
		 * @param {Object.<string, Float32Array>} parameters - AudioWorklet parameters
		*/
		process(inputs, outputs, parameters) {
			const input = inputs[0];
			const output = outputs[0];
			
			// determine channel count from available inputs/outputs
			const channelCount = Math.max(input && input.length || 0, output.length);
			
			// process each sample
			for (let sample = 0; sample < this.blockSize; sample++) {
				// Update parameter values for this sample
				this.updateParams(parameters, sample);
				
				// then process each channel
				for (let channel = 0; channel < channelCount; channel++) {
					// Get input sample (or 0 if no input)
					const inputSample = input && input.length ? input[channel][sample] : 0;
					
					// finally, generate output sample
					output[channel][sample] = this.generate(inputSample, channel, this.params);
				}
			}
			
			// keep processor alive unless disposed
			return !this.disposed;
		}
	};
`;

addBaseClass(singleIOProcess);
