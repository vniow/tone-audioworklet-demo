declare let currentTime: number;
declare let sampleRate: number;

class NoiseWorklet extends AudioWorkletProcessor {
	private isActive = false;
	private frequency = 440; // Hz
	private phase = 0;
	private frameCount = 0;

	private processingStats = {
		totalFrames: 0,
		totalSamples: 0,
		maxValue: 0,
		minValue: Infinity,
		logInterval: 1000,
		startTime: currentTime,
	};

	constructor() {
		super();
		this.port.onmessage = (e) => {
			switch (e.data.type) {
				case 'toggle': {
					this.isActive = e.data.active;
					break;
				}
				case 'frequency': {
					this.frequency = Math.max(20, Math.min(20000, e.data.value));
					break;
				}
			}
		};
	}

	process(_inputs: Float32Array[][], outputs: Float32Array[][]) {
		this.frameCount++;
		this.processingStats.totalFrames++;
		const output = outputs[0];

		if (!this.isActive) {
			output.forEach((channel) => channel.fill(0));
			return true;
		}

		const phaseIncrement = (2 * Math.PI * this.frequency) / sampleRate;
		let currentMaxValue = -Infinity;
		let currentMinValue = Infinity;
		let samplesProcessed = 0;

		for (let channel = 0; channel < output.length; ++channel) {
			const outputChannel = output[channel];
			for (let i = 0; i < outputChannel.length; ++i) {
				const noise = 2 * Math.random() - 1;
				this.phase += phaseIncrement;
				if (this.phase > 2 * Math.PI) {
					this.phase -= 2 * Math.PI;
				}

				const sample = 0.7 * noise + 0.3 * Math.sin(this.phase);
				outputChannel[i] = sample;

				currentMaxValue = Math.max(currentMaxValue, sample);
				currentMinValue = Math.min(currentMinValue, sample);
				samplesProcessed++;
			}
		}

		this.processingStats.totalSamples += samplesProcessed;
		this.processingStats.maxValue = Math.max(this.processingStats.maxValue, currentMaxValue);
		this.processingStats.minValue = Math.min(this.processingStats.minValue, currentMinValue);

		return true;
	}
}

registerProcessor('noise-worklet', NoiseWorklet);
