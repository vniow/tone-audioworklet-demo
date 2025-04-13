import './SingleIOProcessor.worklet'

import { registerProcessor } from '../lib/WorkletGlobalScope'

/**
 * name of worklet
 */
export const workletName = 'noise-processor';

/**
 * simple white noise generator code
 */
export const noiseProcessorWorklet = /* javascript */ `
  /**
   * audio processor that implements a white noise generator
   * 
   * @extends SingleIOProcessor
   */
  class NoiseProcessor extends SingleIOProcessor {
    /**
     * @param {Object} options - AudioWorkletProcessor init options
     */
    constructor(options) {
      super(options);
      
      /**
       * flag to indicate if noise generation is active
       * @type {boolean}
       * @private
       */
      this._isActive = false;
      
      console.log('white noise processor initialized');
    }

    /**
     * define the parameters for this processor
     * @returns {AudioParamDescriptor[]} Parameter descriptors
     */
    static get parameterDescriptors() {
      // no parameters - all control is done via message port
      return [];
    }

    /**
     * process a single sample for noise generation
     * 
     * @param {number} _input - input sample value (null cause it is a source node)
     * @param {number} _channel - channel index
     * @param {Object} _parameters - parameter values
     * @returns {number} generated noise sample
     */
    generate(_input, _channel, _parameters) {
      if (!this._isActive) return 0;
      
      // generate white noise: random values between -1 and 1
      return Math.random() * 2 - 1;
    }
    
    /**
     * handle messages from the main thread
     * 
     * @protected
     * @param {MessageEvent} event - message event from the main thread
     */
    _onMessage(event) {
      super._onMessage(event);
      
      // handle control messages
      if (event.data.type === 'start') {
        this._isActive = true;
        console.log('white noise generation started');
      } else if (event.data.type === 'stop') {
        this._isActive = false;
        console.log('white noise generation stopped');
      }
    }
  }
`;

// register the processor in the worklet global scope
registerProcessor(workletName, noiseProcessorWorklet);
