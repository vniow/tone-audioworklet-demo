import './DelayLine.worklet.js'
import './SingleIOProcessor.worklet.js'

import { registerProcessor } from '../lib/WorkletGlobalScope'

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
      const delayLine = this.delayLines[channel];
      const delaySamples = Math.floor(parameters.delayTime * this.sampleRate);
      const delayedSignal = delayLine.get(0, delaySamples) || 0;
      const newSample = input + (delayedSignal * parameters.feedback);
      delayLine.push(0, newSample);
      return delayedSignal;
    }
  }
`;

registerProcessor(workletName, delayProcessorWorklet);
