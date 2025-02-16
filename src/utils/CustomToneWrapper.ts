import * as Tone from 'tone';

interface CustomToneOptions extends Tone.ToneAudioNodeOptions {
	noiseType?: 'white' | 'pink' | 'brown';
}

export class CustomToneWrapper extends Tone.ToneAudioNode<CustomToneOptions> {
	readonly name = 'CustomToneWrapper';
	readonly input: Tone.InputNode;
	readonly output: Tone.OutputNode;

	private _noise: Tone.Noise;
	private _gain: Tone.Gain;
	private _isPlaying = false;

	constructor(options: Partial<CustomToneOptions> = {}) {
		super(options);

		this._gain = new Tone.Gain({
			// gain: options.gain ?? 1,
		});

		this._noise = new Tone.Noise({
			type: options.noiseType ?? 'white',
			volume: 0, // Set to 0 since we're using gain for volume control
		});

		// Set up audio routing
		this.input = this._noise;
		this.output = this._gain;

		// Connect internal nodes
		this._noise.connect(this._gain);
	}

	get isPlaying(): boolean {
		return this._isPlaying;
	}

	get noiseType(): string {
		return this._noise.type;
	}

	set noiseType(type: 'white' | 'pink' | 'brown') {
		this._noise.type = type;
	}

	get gain(): number {
		return this._gain.gain.value;
	}

	set gain(value: number) {
		this._gain.gain.value = value;
	}

	async start(): Promise<this> {
		await Tone.start();
		this._noise.start();
		this._isPlaying = true;
		return this;
	}

	async stop(): Promise<this> {
		this._noise.stop();
		this._isPlaying = false;
		return this;
	}

	async toggle(): Promise<this> {
		if (this._isPlaying) {
			return this.stop();
		}
		return this.start();
	}

	dispose(): this {
		super.dispose();
		this._noise.dispose();
		this._gain.dispose();
		return this;
	}
}
