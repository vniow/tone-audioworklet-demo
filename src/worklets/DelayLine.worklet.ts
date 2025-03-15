import './ToneAudioWorkletProcessor.worklet.js'

import { addUtility } from '../lib/WorkletGlobalScope.js'

/**
 * DelayLine implementation for audio delay effects
 * Provides an efficient circular buffer for implementing delay-based audio effects.
 */
const delayLine = /* javascript */ `
	/**
	 * A multichannel circular buffer for use within an AudioWorkletProcessor as a delay line
	 * 
	 * This class implements an efficient circular buffer that can be used to create
	 * delay-based audio effects like echo, reverb, chorus, and more.
	 */
	class DelayLine {
		/**
		 * Create a new delay line
		 * 
		 * @param {number} size - Maximum delay length in samples
		 * @param {number} channels - Number of audio channels to support
		 */
		constructor(size, channels) {
			/**
			 * Audio buffer for each channel
			 * @type {Float32Array[]}
			 * @private
			 */
			this.buffer = [];
			
			/**
			 * Write position for each channel
			 * @type {number[]}
			 * @private
			 */
			this.writeHead = [];
			
			/**
			 * Maximum size of the delay buffer in samples
			 * @type {number}
			 * @readonly
			 */
			this.size = size;

			// Initialize channel buffers
			for (let i = 0; i < channels; i++) {
				// Pre-allocate buffers and initialize with silence
				this.buffer[i] = new Float32Array(this.size);
				this.buffer[i].fill(0);
				this.writeHead[i] = 0;
			}
		}

		/**
		 * Push a sample into the delay line
		 * 
		 * @param {number} channel - Channel index
		 * @param {number} value - Sample value to write
		 */
		push(channel, value) {
			// Increment write head position
			this.writeHead[channel] = (this.writeHead[channel] + 1) % this.size;
			
			// Write the sample
			this.buffer[channel][this.writeHead[channel]] = value;
		}

		/**
		 * Get a sample from the delay line at the specified delay
		 * 
		 * @param {number} channel - Channel index
		 * @param {number} delay - Delay in samples (must be less than buffer size)
		 * @returns {number} The delayed sample value
		 */
		get(channel, delay) {
			// Limit delay to buffer size
			const actualDelay = Math.min(delay, this.size - 1);
			
			// Calculate read position
			let readHead = this.writeHead[channel] - Math.floor(actualDelay);
			
			// Wrap around if needed
			if (readHead < 0) {
				readHead += this.size;
			}
			
			return this.buffer[channel][readHead];
		}
		
		/**
		 * Get a sample with fractional delay using linear interpolation
		 * 
		 * @param {number} channel - Channel index
		 * @param {number} delay - Delay in samples, can be fractional
		 * @returns {number} Interpolated sample value
		 */
		getInterpolated(channel, delay) {
			// Integer part of delay
			const floorDelay = Math.floor(delay);
			// Fractional part for interpolation
			const fraction = delay - floorDelay;
			
			// Get the two samples we'll interpolate between
			const sample1 = this.get(channel, floorDelay);
			const sample2 = this.get(channel, floorDelay + 1);
			
			// Linear interpolation between samples
			return sample1 + fraction * (sample2 - sample1);
		}
		
		/**
		 * Clear the delay buffer for all channels
		 */
		clear() {
			for (let i = 0; i < this.buffer.length; i++) {
				this.buffer[i].fill(0);
			}
		}
	}
`;

// Add the DelayLine utility to the worklet global scope
addUtility(delayLine);
