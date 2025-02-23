import * as Tone from 'tone'

export interface CustomOscillatorOptions extends Tone.ToneAudioNodeOptions {
	frequency: number;
}

export class CustomOscillatorNode extends Tone.ToneAudioNode<CustomOscillatorOptions> {
	readonly name = 'CustomOscillator';

	private oscillator: Tone.Oscillator;
	readonly input = undefined;
	output: Tone.Gain;
	private isStarted = false;

	constructor(options?: Partial<CustomOscillatorOptions>) {
		super(options);

		// Create the oscillator node with a valid frequency value
		this.oscillator = new Tone.Oscillator(options?.frequency || 440);

		// Create an output gain node
		this.output = new Tone.Gain({
			context: this.context,
			gain: 0.5,
		});

		this.oscillator.chain(this.output);
	}

	start(time?: number) {
		if (!this.isStarted) {
			this.oscillator.start(time);
			this.isStarted = true;
		}
		return this;
	}

	stop(time?: number) {
		if (this.isStarted) {
			this.oscillator.stop(time);
			this.isStarted = false;
		}
		return this;
	}

	dispose(): this {
		super.dispose();
		if (this.isStarted) {
			this.stop();
		}
		this.oscillator.disconnect();
		this.output.dispose();
		return this;
	}
}
