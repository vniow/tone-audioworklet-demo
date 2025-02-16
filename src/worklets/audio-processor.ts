declare let currentTime: number;

class AtanProcessor extends AudioWorkletProcessor {
	private frameCount = 0;
	private processingStats = {
		totalFrames: 0,
		totalSamples: 0,
		maxValue: 0,
		minValue: Infinity,
		logInterval: 1000,
		startTime: currentTime,
	};

	process(inputs: Float32Array[][], outputs: Float32Array[][]) {
		this.frameCount++;
		this.processingStats.totalFrames++;

		if (!inputs[0]?.length) {
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

		return true;
	}
}

registerProcessor('atan-processor', AtanProcessor);
