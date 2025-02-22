declare let sampleRate: number;

class FilteredNoiseWorklet extends AudioWorkletProcessor {
	private isActive = false;
	private a0 = 0;
	private a1 = 0;
	private a2 = 0;
	private b1 = 0;
	private b2 = 0;
	private z1 = 0;
	private z2 = 0;

	// Filter parameters
	private cutoff = 1000; // Hz
	private q = 1.0;

	constructor() {
		super();
		this.updateFilter();
		this.port.onmessage = (e) => {
			switch (e.data.type) {
				case 'toggle': {
					this.isActive = e.data.active;
					break;
				}
				case 'filter': {
					this.cutoff = Math.max(20, Math.min(20000, e.data.cutoff));
					this.q = Math.max(0.1, Math.min(20, e.data.q));
					this.updateFilter();
					break;
				}
			}
		};
	}

	private updateFilter() {
		const w0 = (2 * Math.PI * this.cutoff) / sampleRate;
		const alpha = Math.sin(w0) / (2 * this.q);
		const cosw0 = Math.cos(w0);

		const norm = 1 / (1 + alpha);
		this.a0 = alpha * norm;
		this.a1 = 0;
		this.a2 = -alpha * norm;
		this.b1 = -2 * cosw0 * norm;
		this.b2 = (1 - alpha) * norm;
	}

	process(_inputs: Float32Array[][], outputs: Float32Array[][]) {
		const output = outputs[0];

		if (!this.isActive) {
			output.forEach((channel) => channel.fill(0));
			return true;
		}

		for (let channel = 0; channel < output.length; ++channel) {
			const outputChannel = output[channel];

			for (let i = 0; i < outputChannel.length; ++i) {
				// Generate noise
				const noise = 2 * Math.random() - 1;

				// Apply biquad filter
				const x = noise;
				const y = this.a0 * x + this.a1 * this.z1 + this.a2 * this.z2 + this.b1 * this.z1 + this.b2 * this.z2;

				this.z2 = this.z1;
				this.z1 = y;

				outputChannel[i] = y * 0.5; // Scale down the output
			}
		}

		return true;
	}
}

registerProcessor('filtered-noise-worklet', FilteredNoiseWorklet);
