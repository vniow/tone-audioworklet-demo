import './ToneAudioWorkletProcessor.worklet.js'

import { addUtility } from '../lib/WorkletGlobalScope.js'

/**
 * DelayLine implementation for audio delay effects
 * Provides an efficient circular buffer for implementing delay-based audio effects.
 */
const delayLine = /* javascript */ `
	/**
	 * multichannel circular buffer for use within an AudioWorkletProcessor as a delay line
	 * 
	 * implements an efficient circular buffer that can be used to create
	 * delay-based audio effects like echo, reverb, chorus, and more
	 */
	class DelayLine {
		/**
		 * create a new delay line
		 * 
		 * @param {number} size - maximum delay length in samples
		 * @param {number} channels - number of audio channels to support
		 */
		constructor(size, channels) {
			/**
			 * audio buffer for each channel
			 * @type {Float32Array[]}
			 * @private
			 */
			this.buffer = [];
			
			/**
			 * write position for each channel
			 * @type {number[]}
			 * @private
			 */
			this.writeHead = [];
			
			/**
			 * maximum size of the delay buffer in samples
			 * @type {number}
			 * @readonly
			 */
			this.size = size;

			// init channel buffers
			for (let i = 0; i < channels; i++) {
				// pre-allocate buffers and initialize with silence
				this.buffer[i] = new Float32Array(this.size);
				this.buffer[i].fill(0);
				this.writeHead[i] = 0;
			}
		}

		/**
		 * push a sample into the delay line
		 * 
		 * @param {number} channel - channel index
		 * @param {number} value - sample value to write
		 */
		push(channel, value) {
			// increment write head position
			this.writeHead[channel] = (this.writeHead[channel] + 1) % this.size;
			
			// write the sample
			this.buffer[channel][this.writeHead[channel]] = value;
		}

		/**
		 * get a sample from the delay line at the specified delay
		 * 
		 * @param {number} channel - channel index
		 * @param {number} delay - delay in samples (must be less than buffer size)
		 * @returns {number} the delayed sample value
		 */
		get(channel, delay) {
			// limit delay to buffer size
			const actualDelay = Math.min(delay, this.size - 1);
			
			// calculate read position
			let readHead = this.writeHead[channel] - Math.floor(actualDelay);
			
			// wrap around if needed
			if (readHead < 0) {
				readHead += this.size;
			}
			
			return this.buffer[channel][readHead];
		}
		
		/**
		 * get a sample with fractional delay using linear interpolation
		 * 
		 * @param {number} channel - channel index
		 * @param {number} delay - delay in samples, can be fractional
		 * @returns {number} interpolated sample value
		 */
		getInterpolated(channel, delay) {
			// integer part of delay
			const floorDelay = Math.floor(delay);
			// fractional part for interpolation
			const fraction = delay - floorDelay;
			
			// get the two samples we'll interpolate between
			const sample1 = this.get(channel, floorDelay);
			const sample2 = this.get(channel, floorDelay + 1);
			
			// linear interpolation between samples
			return sample1 + fraction * (sample2 - sample1);
		}
		
		/**
		 * clear the delay buffer for all channels
		 */
		clear() {
			for (let i = 0; i < this.buffer.length; i++) {
				this.buffer[i].fill(0);
			}
		}
	}
`;

// add the DelayLine class to the global worklet scope
addUtility(delayLine);
