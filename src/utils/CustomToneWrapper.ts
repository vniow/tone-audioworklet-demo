import * as Tone from 'tone';

interface CustomToneOptions extends Tone.ToneAudioNodeOptions {
	noiseType?: 'white' | 'pink' | 'brown';
	volume?: number;
}

export class CustomToneWrapper extends Tone.ToneAudioNode<CustomToneOptions> {
	readonly name = 'CustomToneWrapper';
	readonly input: Tone.InputNode;
	readonly output: Tone.OutputNode;

	private _noise: Tone.Noise;
	private _volume: Tone.Volume;
	private _isPlaying = false;

	constructor(options: Partial<CustomToneOptions> = {}) {
		super(options);

		this._volume = new Tone.Volume({
			volume: options.volume ?? 0,
		});

		this._noise = new Tone.Noise({
			type: options.noiseType ?? 'white',
			volume: -10,
		});

		// Set up audio routing
		this.input = this._noise;
		this.output = this._volume;

		// Connect internal nodes
		this._noise.connect(this._volume);
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

	get volume(): number {
		return this._volume.volume.value;
	}

	set volume(value: number) {
		this._volume.volume.value = value;
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
		this._volume.dispose();
		return this;
	}
}
