declare let currentTime: number;
declare let sampleRate: number;

console.group('🎵 Atan Processor Setup');
console.log('Initializing processor:', {
	timestamp: new Date().toISOString(),
	type: 'AtanProcessor',
});

class AtanProcessor extends AudioWorkletProcessor {
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
		console.group('🎵 AtanProcessor Constructor');
		super();
		console.log('Initializing with defaults:', {
			sampleRate: sampleRate,
			frameCount: this.frameCount,
			timestamp: new Date().toISOString(),
		});
		console.groupEnd();
	}

	process(inputs: Float32Array[][], outputs: Float32Array[][]) {
		this.frameCount++;
		this.processingStats.totalFrames++;

		if (!inputs[0]?.length) {
			if (this.frameCount % 100 === 0) {
				console.warn('🎵 [Processor] No input received:', {
					frame: this.frameCount,
					time: currentTime,
					totalFrames: this.processingStats.totalFrames,
				});
			}
			return true;
		}

		const atan = 10;
		let currentMaxValue = -Infinity;
		let currentMinValue = Infinity;
		let samplesProcessed = 0;

		for (let i = 0; i < inputs.length; i++) {
			for (let j = 0; j < inputs[i].length; j++) {
				for (let k = 0; k < inputs[i][j].length; k++) {
					const inputSample = inputs[i][j][k];
					const processedSample = Math.atan(atan * inputSample) / Math.atan(atan);

					outputs[i][j][k] = processedSample;

					currentMaxValue = Math.max(currentMaxValue, processedSample);
					currentMinValue = Math.min(currentMinValue, processedSample);
					samplesProcessed++;
				}
			}
		}

		this.processingStats.totalSamples += samplesProcessed;
		this.processingStats.maxValue = Math.max(this.processingStats.maxValue, currentMaxValue);
		this.processingStats.minValue = Math.min(this.processingStats.minValue, currentMinValue);

		if (this.frameCount % this.processingStats.logInterval === 0) {
			const now = currentTime;
			const timeSinceLastLog = now - this.lastLog;
			const totalTime = now - this.processingStats.startTime;

			console.group('🎵 AtanProcessor Stats');
			console.log('Processing metrics:', {
				frame: this.frameCount,
				timeSinceLastLog: timeSinceLastLog.toFixed(3) + 's',
				totalTime: totalTime.toFixed(3) + 's',
				averageFrameTime: (timeSinceLastLog / this.processingStats.logInterval).toFixed(5) + 's',
				inputChannels: inputs.length,
				bufferSize: inputs[0][0].length,
				samplesProcessed: this.processingStats.totalSamples,
				sampleRate: sampleRate,
			});

			console.log('Audio metrics:', {
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

registerProcessor('atan-processor', AtanProcessor);
console.log('AtanProcessor registration complete');
console.groupEnd();
