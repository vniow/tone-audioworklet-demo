import './DelayLine.worklet.js'
import './SingleIOProcessor.worklet.js'

import { registerProcessor } from './WorkletGlobalScope.js'

export const workletName = 'delay-processor';

export const delayProcessorWorklet = /* javascript */ `
  class DelayProcessor extends SingleIOProcessor {
    constructor(options) {
      super(options);
      
      // Create delay line for each channel (assume stereo)
      this.maxDelayTime = 2; // 2 seconds max delay
      this.delayLines = new Array(options.outputChannelCount[0]).fill(null).map(() => 
        new DelayLine(Math.ceil(this.maxDelayTime * options.processorOptions.sampleRate), 1)
      );
    }

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
        maxValue: 0.99,
        automationRate: 'k-rate'
      }];
    }

    generate(input, channel, parameters) {
      // Get the delay line for this channel
      const delayLine = this.delayLines[channel];
      
      // Calculate delay in samples
      const delaySamples = Math.floor(parameters.delayTime * this.sampleRate);
      
      // Get delayed signal
      const delayedSignal = delayLine.get(0, delaySamples) || 0;
      
      // Calculate new sample with feedback
      const newSample = input + (delayedSignal * parameters.feedback);
      
      // Store the new sample
      delayLine.push(0, newSample);
      
      // Return the delayed signal for the wet path
      return delayedSignal;
    }
  }
`;

registerProcessor(workletName, delayProcessorWorklet);
