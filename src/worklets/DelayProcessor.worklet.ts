import './DelayLine.worklet.js'
import './SingleIOProcessor.worklet.js'

import { registerProcessor } from '../lib/WorkletGlobalScope.js'

/**
 * name of worklet
 */
export const workletName = 'delay-processor';

/**
 * delay processor - creates an echo/delay effect with feedback control
 */
export const delayProcessorWorklet = /* javascript */ `
  /**
   * audio processor that implements a feedback delay effect
   * 
   * @extends SingleIOProcessor
   */
  class DelayProcessor extends SingleIOProcessor {
    /**
     * @param {Object} options - AudioWorkletProcessor init options
     */
    constructor(options) {
      super(options);
      
      /**
       * maximum delay time in seconds
       * @type {number}
       * @private
       */
      this.maxDelayTime = 2; // 2 seconds max delay
      
      /**
       * delay lines for each channel
       * @type {DelayLine[]}
       * @private
       */
      this.delayLines = new Array(options.outputChannelCount[0]).fill(null).map(() => 
        new DelayLine(Math.ceil(this.maxDelayTime * options.processorOptions.sampleRate), 1)
      );
      
      /**
       * last feedback values applied, for smoothing transitions
       * @type {number[]}
       * @private
       */
      this._lastFeedback = new Array(options.outputChannelCount[0]).fill(0);

      console.log('🎛️ delay processor initialized with max delay time:', this.maxDelayTime, 'seconds');
      

    }

    /**
     * define the processor parameters 
     * @returns {AudioParamDescriptor[]} parameter descriptors
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
        maxValue: 0.99,  // prevent runaway feedback
        automationRate: 'k-rate'
      }];
    }

    /**
     * process a single sample for the delay effect
     * 
     * @param {number} input - input sample value
     * @param {number} channel - channel index
     * @param {Object} parameters - parameter values
     * @param {number} parameters.delayTime - current delay time in seconds
     * @param {number} parameters.feedback - current feedback amount (0-1)
     * @returns {number} processed sample with delay effect
     */
    generate(input, channel, parameters) {
      const delayLine = this.delayLines[channel];
      
      // convert delay time in seconds to samples
      const delaySamples = Math.floor(parameters.delayTime * this.sampleRate);
      
      // get the delayed signal
      const delayedSignal = delayLine.get(0, delaySamples) || 0;
      
      // apply feedback with safety clipping
      // apply slight smoothing to feedback value to prevent clicks
      const smoothedFeedback = 0.9 * this._lastFeedback[channel] + 0.1 * parameters.feedback;
      this._lastFeedback[channel] = smoothedFeedback;
      
      // calculate new sample with feedback
      const newSample = input + (delayedSignal * smoothedFeedback);
      
      // safety clipping to prevent runaway feedback (-1 to 1)
      const clippedSample = Math.max(-1, Math.min(1, newSample));
      
      // push to delay line
      delayLine.push(0, clippedSample);
      
      // return the delayed signal
      return delayedSignal;
    }
    
    /**
     * handle messages from the main thread
     * 
     * @protected
     * @param {MessageEvent} event - message event from the main thread
     */
    _onMessage(event) {
      super._onMessage(event);
      
      // handle custom messages
      if (event.data.type === 'clear') {
        // clear the delay buffer when requested
        this.delayLines.forEach(line => line.clear());
      }
    }
  }
`;

// register the DelayProcessor in the worklet global scope
registerProcessor(workletName, delayProcessorWorklet);
