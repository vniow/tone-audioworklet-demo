import './SingleIOProcessor.worklet'

import { registerProcessor } from '../lib/WorkletGlobalScope'

/**
 * worklet name
 */
export const workletName = 'bit-crusher';

/**
 * BitCrushers reduce the resolution of an audio signal, creating a "lo-fi" effect
 */
export const bitCrusherWorklet = /* javascript */ `
	/**
	 * @extends SingleIOProcessor
	 */
	class BitCrusherWorklet extends SingleIOProcessor {
		/**
		 * define the parameters for this processor
		 * @returns {AudioParamDescriptor[]} parameter descriptors
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
		 * process a single sample by reducing its bit depth
		 * 
		 * @param {number} input - input sample value
		 * @param {number} _channel - channel number (unused)
		 * @param {Object} parameters - parameter values
		 * @param {number} parameters.bits - bit depth (1-16)
		 * @returns {number} quantized sample
		 */
		generate(input, _channel, parameters) {
			// calculate the step size for the bit depth
			// formula: 2^(bits-1) gives us the number of possible values for positive numbers
			const step = Math.pow(0.5, parameters.bits - 1);
			
			// quantize the input to the step size
			// Math.floor(input/step + 0.5) rounds to the nearest step
			// then multiply back by step to get the quantized value
			const val = step * Math.floor(input / step + 0.5);
			
			// return the quantized sample (which is now reduced in resolution)
			return val;
		}
		
		/**
		 * handle messages from the main thread
		 * 
		 * @protected
		 * @param {MessageEvent} event - message event from the main thread
		 */
		_onMessage(event) {
			super._onMessage(event);
			
		}
	}
`;

// register the BitCrusherWorklet with the global scope
registerProcessor(workletName, bitCrusherWorklet);
