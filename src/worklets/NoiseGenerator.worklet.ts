import './SingleIOProcessor.worklet.js'

import { registerProcessor } from './WorkletGlobalScope.js'

export const workletName = 'noise-generator';

export const noiseGeneratorWorklet = /* javascript */ `
    class NoiseGeneratorWorklet extends SingleIOProcessor {

        static get parameterDescriptors() {
            return [{
                name: "amplitude",
                defaultValue: 0.5,
                minValue: 0,
                maxValue: 1,
                automationRate: 'k-rate'
            }, {
                name: "type",
                defaultValue: 0, // 0 = white, 1 = pink, 2 = brown
                minValue: 0,
                maxValue: 2,
                automationRate: 'k-rate'
            }];
        }

        constructor(options) {
            super(options);
            // For pink noise
            this.pinkNoise = new Array(7).fill(0);
            // For brown noise
            this.brownNoise = 0;
        }

        generate(_input, _channel, parameters) {
            // White noise is just random values between -1 and 1
            let noise;
            
            // Choose noise type based on parameter
            const noiseType = Math.floor(parameters.type);
            
            if (noiseType === 1) {
                // Pink noise - equal energy per octave
                noise = this.generatePinkNoise();
            } else if (noiseType === 2) {
                // Brown noise - more bass, less treble
                noise = this.generateBrownNoise();
            } else {
                // Default: white noise - equal energy at all frequencies
                noise = this.generateWhiteNoise();
            }
            
            // Apply amplitude
            return noise * parameters.amplitude;
        }

        generateWhiteNoise() {
            return (Math.random() * 2 - 1);
        }

        generatePinkNoise() {
            let white = this.generateWhiteNoise();
            // Pink noise filter
            this.pinkNoise[0] = 0.99886 * this.pinkNoise[0] + white * 0.0555179;
            this.pinkNoise[1] = 0.99332 * this.pinkNoise[1] + white * 0.0750759;
            this.pinkNoise[2] = 0.96900 * this.pinkNoise[2] + white * 0.1538520;
            this.pinkNoise[3] = 0.86650 * this.pinkNoise[3] + white * 0.3104856;
            this.pinkNoise[4] = 0.55000 * this.pinkNoise[4] + white * 0.5329522;
            this.pinkNoise[5] = -0.7616 * this.pinkNoise[5] - white * 0.0168980;
            
            // Mix
            const pink = this.pinkNoise[0] + this.pinkNoise[1] + this.pinkNoise[2] + 
                this.pinkNoise[3] + this.pinkNoise[4] + this.pinkNoise[5] + this.pinkNoise[6] + white * 0.5362;
                
            // Normalize to roughly [-1, 1]
            return pink * 0.11;
        }

        generateBrownNoise() {
            // Brown noise is integrated white noise
            const white = this.generateWhiteNoise();
            this.brownNoise = (this.brownNoise + (0.02 * white)) / 1.02;
            // Normalize to roughly [-1, 1]
            return this.brownNoise * 3.5;
        }
    }
`;

registerProcessor(workletName, noiseGeneratorWorklet);
