import './SingleIOProcessor.worklet'

import { registerProcessor } from '../lib/WorkletGlobalScope'

export const workletName = 'noise-generator';

export const noiseGeneratorWorklet = /* javascript */ `
    class NoiseGeneratorWorklet extends SingleIOProcessor {
        private _state = 'stopped'; // 'started' or 'stopped'
        private _pinkNoise = [0, 0, 0, 0, 0, 0]; // Pink noise filter coefficients
        private _brownNoise = 0; // Brown noise last sample
        
        constructor(options) {
            super(options);
            this.port.onmessage = (e) => {
                if (e.data.type === 'setState') {
                    this._state = e.data.state;
                }
            };
        }

        static get parameterDescriptors() {
            return [{
                name: "noiseType",
                defaultValue: 0,  // 0: white, 1: pink, 2: brown, 3: digital
                minValue: 0,
                maxValue: 3,
                automationRate: 'k-rate'
            }];
        }
        
        // Pink noise algorithm (Paul Kellett's simplified algorithm)
        generatePinkNoise() {
            const white = Math.random() * 2 - 1;
            this._pinkNoise[0] = 0.99886 * this._pinkNoise[0] + white * 0.0555179;
            this._pinkNoise[1] = 0.99332 * this._pinkNoise[1] + white * 0.0750759;
            this._pinkNoise[2] = 0.96900 * this._pinkNoise[2] + white * 0.1538520;
            this._pinkNoise[3] = 0.86650 * this._pinkNoise[3] + white * 0.3104856;
            this._pinkNoise[4] = 0.55000 * this._pinkNoise[4] + white * 0.5329522;
            this._pinkNoise[5] = -0.7616 * this._pinkNoise[5] - white * 0.0168980;
            return this._pinkNoise[0] + this._pinkNoise[1] + this._pinkNoise[2] + 
                   this._pinkNoise[3] + this._pinkNoise[4] + this._pinkNoise[5] + 
                   white * 0.5362;
        }
        
        // Brown noise generation
        generateBrownNoise() {
            const white = Math.random() * 2 - 1;
            this._brownNoise = (this._brownNoise + (0.02 * white)) / 1.02;
            return this._brownNoise * 3.5; // Scale to match other noise volumes
        }

        // Digital/bitwise noise
        generateDigitalNoise() {
            return Math.random() > 0.5 ? 0.8 : -0.8; // Square-like digital noise
        }

        generate(_input, _channel, parameters) {
            // Return silence if stopped
            if (this._state !== 'started') {
                return 0;
            }
            
            // Get noise type parameter
            const noiseType = Math.floor(parameters.noiseType[0]);
            
            // Generate appropriate noise type
            switch(noiseType) {
                case 0: // White noise
                    return Math.random() * 2 - 1;
                case 1: // Pink noise
                    return this.generatePinkNoise() * 0.5;
                case 2: // Brown noise
                    return this.generateBrownNoise() * 0.5;
                case 3: // Digital noise
                    return this.generateDigitalNoise();
                default:
                    return Math.random() * 2 - 1; // Default to white noise
            }
        }
    }
`;

registerProcessor(workletName, noiseGeneratorWorklet);
