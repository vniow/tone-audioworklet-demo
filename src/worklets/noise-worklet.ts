declare let currentTime: number;
declare let sampleRate: number;

console.group('🎵 Noise Worklet Setup');
console.log('Initializing processor:', {
	timestamp: new Date().toISOString(),
	type: 'NoiseWorklet',
});

class NoiseWorklet extends AudioWorkletProcessor {
	private isActive = false;
	private frequency = 440; // Hz
	private amplitude = 0.5;
	private phase = 0;
	private frameCount = 0;
	private lastLog = 0;
	private processingStats = {
		totalFrames: 0,
		totalSamples: 0,
		maxValue: 0,
		minValue: Infinity,
		logInterval: 1000,
		startTime: currentTime,
	};

	constructor() {
		console.group('🎵 NoiseWorklet Constructor');
		super();
		console.log('Initializing with defaults:', {
			sampleRate,
			frequency: this.frequency,
			amplitude: this.amplitude,
			timestamp: new Date().toISOString(),
		});

		this.port.onmessage = (e) => {
			console.group('🎵 NoiseWorklet Message');
			console.log('Message received:', e.data);

			switch (e.data.type) {
				case 'toggle': {
					this.isActive = e.data.active;
					console.log(`Noise Generator ${this.isActive ? 'activated' : 'deactivated'}`);
					break;
				}
				case 'frequency': {
					const oldFreq = this.frequency;
					this.frequency = Math.max(20, Math.min(20000, e.data.value));
					console.log('Frequency updated:', {
						old: oldFreq,
						new: this.frequency,
						requested: e.data.value,
					});
					break;
				}
				case 'amplitude': {
					const oldAmp = this.amplitude;
					this.amplitude = Math.max(0, Math.min(1, e.data.value));
					console.log('Amplitude updated:', {
						old: oldAmp,
						new: this.amplitude,
						requested: e.data.value,
					});
					break;
				}
			}
			console.groupEnd();
		};
		console.groupEnd();
	}

	process(_inputs: Float32Array[][], outputs: Float32Array[][]) {
		this.frameCount++;
		this.processingStats.totalFrames++;
		const output = outputs[0];

		if (!this.isActive) {
			if (this.frameCount % 100 === 0) {
				console.log('🎵 NoiseWorklet inactive, outputting silence');
			}
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

				const sample = this.amplitude * (0.7 * noise + 0.3 * Math.sin(this.phase));
				outputChannel[i] = sample;

				currentMaxValue = Math.max(currentMaxValue, sample);
				currentMinValue = Math.min(currentMinValue, sample);
				samplesProcessed++;
			}
		}

		this.processingStats.totalSamples += samplesProcessed;
		this.processingStats.maxValue = Math.max(this.processingStats.maxValue, currentMaxValue);
		this.processingStats.minValue = Math.min(this.processingStats.minValue, currentMinValue);

		if (this.frameCount % this.processingStats.logInterval === 0) {
			const now = currentTime;
			const timeSinceLastLog = now - this.lastLog;
			const totalTime = now - this.processingStats.startTime;

			console.group('🎵 NoiseWorklet Stats');
			console.log('Processing metrics:', {
				frame: this.frameCount,
				timeSinceLastLog: timeSinceLastLog.toFixed(3) + 's',
				totalTime: totalTime.toFixed(3) + 's',
				averageFrameTime: (timeSinceLastLog / this.processingStats.logInterval).toFixed(5) + 's',
				channels: output.length,
				bufferSize: output[0].length,
				samplesProcessed: this.processingStats.totalSamples,
				sampleRate,
			});

			console.log('Audio metrics:', {
				frequency: this.frequency,
				amplitude: this.amplitude,
				currentMaxValue: currentMaxValue.toFixed(4),
				currentMinValue: currentMinValue.toFixed(4),
				overallMaxValue: this.processingStats.maxValue.toFixed(4),
				overallMinValue: this.processingStats.minValue.toFixed(4),
			});
			console.groupEnd();

			this.lastLog = now;
		}

		return true;
	}
}

registerProcessor('noise-worklet', NoiseWorklet);
console.log('NoiseWorklet registration complete');
console.groupEnd();
