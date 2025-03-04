import './DelayLine.worklet.js'
import './SingleIOProcessor.worklet.js'

import { registerProcessor } from './WorkletGlobalScope.js'

export const workletName = 'delay-processor';

export const delayProcessorWorklet = /* javascript */ `
  class DelayProcessor extends SingleIOProcessor {
    constructor(options) {
      super(options);
      this.delayLine = new DelayLine(44100, 2); // 1 second delay buffer, stereo
      this.delayTimeParam = options.parameterData.delayTime || 0.5;
      this.feedbackParam = options.parameterData.feedback || 0.5;
    }

    static get parameterDescriptors() {
      return [{
        name: "delayTime",
        defaultValue: 0.5,
        minValue: 0,
        maxValue: 1,
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
      // Get delay in samples (assuming 44100Hz sample rate)
      const delaySamples = Math.floor(parameters.delayTime * this.sampleRate);
      
      // Get delayed signal
      const delayedSignal = this.delayLine.get(channel, delaySamples);
      
      // Create output with feedback
      const output = input + delayedSignal * parameters.feedback;
      
      // Store the current output
      this.delayLine.push(channel, output);
      
      return output;
    }
  }
`;

registerProcessor(workletName, delayProcessorWorklet);
