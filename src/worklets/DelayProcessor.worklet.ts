import './DelayLine.worklet.js'
import './SingleIOProcessor.worklet.js'

import { registerProcessor } from '../lib/WorkletGlobalScope.js'

/**
 * Name to register the delay processor with
 */
export const workletName = 'delay-processor';

/**
 * Delay processor implementation
 * This creates an echo/delay effect with feedback control.
 */
export const delayProcessorWorklet = /* javascript */ `
  /**
   * Audio processor that implements a feedback delay effect.
   * 
   * @extends SingleIOProcessor
   */
  class DelayProcessor extends SingleIOProcessor {
    /**
     * @param {Object} options - AudioWorkletProcessor initialization options
     */
    constructor(options) {
      super(options);
      
      /**
       * Maximum delay time in seconds
       * @type {number}
       * @private
       */
      this.maxDelayTime = 2; // 2 seconds max delay
      
      /**
       * Delay lines for each channel
       * @type {DelayLine[]}
       * @private
       */
      this.delayLines = new Array(options.outputChannelCount[0]).fill(null).map(() => 
        new DelayLine(Math.ceil(this.maxDelayTime * options.processorOptions.sampleRate), 1)
      );
      
      /**
       * Last feedback values applied, for smoothing transitions
       * @type {number[]}
       * @private
       */
      this._lastFeedback = new Array(options.outputChannelCount[0]).fill(0);

      console.log('🎛️ Delay processor initialized with max delay time:', this.maxDelayTime, 'seconds');
      

    }

    /**
     * Define the parameters for this processor
     * @returns {AudioParamDescriptor[]} Parameter descriptors
     */
    static get parameterDescriptors() {
      return [{
        name: "delayTime",
        defaultValue: 0.5,
        minValue: 0,
        maxValue: 2,
        automationRate: 'k-rate'
      }, {
        name: "feedback",
        defaultValue: 0.5,
        minValue: 0,
        maxValue: 0.99,  // Prevent runaway feedback
        automationRate: 'k-rate'
      }];
    }

    /**
     * Process a single sample for the delay effect
     * 
     * @param {number} input - Input sample value
     * @param {number} channel - Channel index
     * @param {Object} parameters - Parameter values
     * @param {number} parameters.delayTime - Current delay time in seconds
     * @param {number} parameters.feedback - Current feedback amount (0-1)
     * @returns {number} Processed sample with delay effect
     */
    generate(input, channel, parameters) {
      const delayLine = this.delayLines[channel];
      
      // Convert delay time in seconds to samples
      const delaySamples = Math.floor(parameters.delayTime * this.sampleRate);
      
      // Get the delayed signal
      const delayedSignal = delayLine.get(0, delaySamples) || 0;
      
      // Apply feedback with safety clipping
      // Apply slight smoothing to feedback value to prevent clicks
      const smoothedFeedback = 0.9 * this._lastFeedback[channel] + 0.1 * parameters.feedback;
      this._lastFeedback[channel] = smoothedFeedback;
      
      // Calculate new sample with feedback
      const newSample = input + (delayedSignal * smoothedFeedback);
      
      // Safety clipping to prevent runaway feedback (-1 to 1)
      const clippedSample = Math.max(-1, Math.min(1, newSample));
      
      // Push to delay line
      delayLine.push(0, clippedSample);
      
      // Return the delayed signal
      return delayedSignal;
    }
    
    /**
     * Handle messages from the main thread
     * 
     * @protected
     * @param {MessageEvent} event - Message event from the main thread
     */
    _onMessage(event) {
      super._onMessage(event);
      
      // Handle custom messages
      if (event.data.type === 'clear') {
        // Clear the delay buffer when requested
        this.delayLines.forEach(line => line.clear());
      }
    }
  }
`;

registerProcessor(workletName, delayProcessorWorklet);
