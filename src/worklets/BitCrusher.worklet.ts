import './SingleIOProcessor.worklet'

import { registerProcessor } from '../lib/WorkletGlobalScope'

/**
 * Name to register the processor with
 */
export const workletName = 'bit-crusher';

/**
 * BitCrusher worklet implementation
 * Reduces the resolution of the audio signal to create a "lo-fi" effect
 */
export const bitCrusherWorklet = /* javascript */ `
	/**
	 * Reduces the bit depth of the audio signal to create a lo-fi effect
	 * 
	 * @extends SingleIOProcessor
	 */
	class BitCrusherWorklet extends SingleIOProcessor {
		/**
		 * Define the parameters for this processor
		 * @returns {AudioParamDescriptor[]} Parameter descriptors
		 */
		static get parameterDescriptors() {
			return [{
				name: "bits",
				defaultValue: 8,
				minValue: 1,
				maxValue: 16,
				automationRate: 'k-rate'
			}];
		}

		/**
		 * Process a single sample by reducing its bit depth
		 * 
		 * @param {number} input - Input sample value
		 * @param {number} _channel - Channel number (unused)
		 * @param {Object} parameters - Parameter values
		 * @param {number} parameters.bits - Bit depth (1-16)
		 * @returns {number} Quantized sample
		 */
		generate(input, _channel, parameters) {
			// Calculate the step size for the bit depth
			// Formula: 2^(bits-1) gives us the number of possible values for positive numbers
			const step = Math.pow(0.5, parameters.bits - 1);
			
			// Quantize the input to the step size
			// Math.floor(input/step + 0.5) rounds to the nearest step
			// Then multiply back by step to get the quantized value
			const val = step * Math.floor(input / step + 0.5);
			
			// Return the quantized sample (which is now reduced in resolution)
			return val;
		}
		
		/**
		 * Handle messages from the main thread
		 * 
		 * @protected
		 * @param {MessageEvent} event - Message event from the main thread
		 */
		_onMessage(event) {
			super._onMessage(event);
			
			// Custom messages can be handled here
			// Currently none specific to BitCrusher
		}
	}
`;

registerProcessor(workletName, bitCrusherWorklet);
