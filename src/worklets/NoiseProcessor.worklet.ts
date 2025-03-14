import './SingleIOProcessor.worklet'

import { addToWorklet, registerProcessor } from '../lib/WorkletGlobalScope'

/**
 * Name to register the noise processor with
 */
export const workletName = 'noise-processor';

/**
 * White noise generator processor implementation
 * Generates simple white noise
 */
export const noiseProcessorWorklet = /* javascript */ `
  /**
   * Audio processor that implements a white noise generator.
   * 
   * @extends SingleIOProcessor
   */
  class NoiseProcessor extends SingleIOProcessor {
    /**
     * @param {Object} options - AudioWorkletProcessor initialization options
     */
    constructor(options) {
      super(options);
      
      /**
       * Flag to indicate if noise generation is active
       * @type {boolean}
       * @private
       */
      this._isActive = false;
      
      console.log('White noise processor initialized');
    }

    /**
     * Define the parameters for this processor
     * @returns {AudioParamDescriptor[]} Parameter descriptors
     */
    static get parameterDescriptors() {
      // No parameters - all control is done via message port
      return [];
    }

    /**
     * Process a single sample for noise generation
     * 
     * @param {number} _input - Input sample value (ignored for noise generation)
     * @param {number} _channel - Channel index
     * @param {Object} _parameters - Parameter values
     * @returns {number} Generated noise sample
     */
    generate(_input, _channel, _parameters) {
      if (!this._isActive) return 0;
      
      // Generate white noise: random values between -1 and 1
      return Math.random() * 2 - 1;
    }
    
    /**
     * Handle messages from the main thread
     * 
     * @protected
     * @param {MessageEvent} event - Message event from the main thread
     */
    _onMessage(event) {
      super._onMessage(event);
      
      // Handle control messages
      if (event.data.type === 'start') {
        this._isActive = true;
        console.log('White noise generation started');
      } else if (event.data.type === 'stop') {
        this._isActive = false;
        console.log('White noise generation stopped');
      }
    }
  }
`;

// Register the processor class
addToWorklet(noiseProcessorWorklet);
registerProcessor(workletName, 'NoiseProcessor');
