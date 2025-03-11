import * as Tone from 'tone'

import { ToneWorkletBase, ToneWorkletBaseOptions } from './ToneWorkletBase'

export interface NoiseGeneratorOptions extends ToneWorkletBaseOptions {
	noiseType?: number; // 0: white, 1: pink, 2: brown, 3: digital
	wet?: number;
}

export class NoiseGeneratorNode extends ToneWorkletBase<NoiseGeneratorOptions> {
	readonly name: string = 'NoiseGeneratorNode';
	readonly input: Tone.Gain;
	readonly output: Tone.Gain;
	readonly noiseType: Tone.Param<'number'>;
	private _wetDry: Tone.CrossFade;
	private _state: 'started' | 'stopped' = 'stopped';

	constructor(options: Partial<NoiseGeneratorOptions> = {}) {
		// Merge default options with provided options
		const opts = {
			...NoiseGeneratorNode.getDefaults(),
			...options,
		};
		super(opts);

		this.input = new Tone.Gain({ context: this.context });
		this.output = new Tone.Gain({ context: this.context });

		// Param for noise type control
		this.noiseType = new Tone.Param<'number'>({
			context: this.context,
			value: opts.noiseType ?? 0,
			units: 'number',
			minValue: 0,
			maxValue: 3,
			param: this._dummyParam,
			swappable: true,
		});

		// Wet/dry control
		this._wetDry = new Tone.CrossFade({
			context: this.context,
			fade: opts.wet ?? 1,
		});

		// Connect dry signal path
		this.input.connect(this._wetDry.a);
		this._wetDry.connect(this.output);
	}

	protected _audioWorkletName(): string {
		return 'noise-generator';
	}

	onReady(node: AudioWorkletNode) {
		// Connect the worklet to the wet signal path
		node.connect(this._wetDry.b);

		// Connect parameters
		const noiseTypeParam = node.parameters.get('noiseType');
		if (noiseTypeParam) {
			this.noiseType.setParam(noiseTypeParam);
		}

		// Set initial state
		this._worklet.port.postMessage({ type: 'setState', state: this._state });

		console.log('✅ NoiseGenerator worklet ready', {
			noiseType: this.noiseType.value,
			wet: this._wetDry.fade.value,
			state: this._state,
		});
	}

	static getDefaults(): NoiseGeneratorOptions {
		return Object.assign(ToneWorkletBase.getDefaults(), {
			noiseType: 0,
			wet: 1,
		});
	}

	/**
	 * Start generating noise
	 */
	async start(): Promise<this> {
		if (this._state !== 'started') {
			this._state = 'started';
			if (this._worklet) {
				this._worklet.port.postMessage({ type: 'setState', state: 'started' });
				console.log('▶️ NoiseGenerator started');
			}
		}
		return this;
	}

	/**
	 * Stop generating noise
	 */
	async stop(): Promise<this> {
		if (this._state !== 'stopped') {
			this._state = 'stopped';
			if (this._worklet) {
				this._worklet.port.postMessage({ type: 'setState', state: 'stopped' });
				console.log('⏹️ NoiseGenerator stopped');
			}
		}
		return this;
	}

	/**
	 * Get the current playback state
	 */
	get state(): 'started' | 'stopped' {
		return this._state;
	}

	/**
	 * Get the current wet/dry mix
	 */
	get wet(): number {
		return this._wetDry.fade.value;
	}

	/**
	 * Set the wet/dry mix
	 */
	set wet(value: number) {
		this._wetDry.fade.value = value;
	}

	/**
	 * Clean up resources
	 */
	dispose(): this {
		super.dispose();
		this.input.dispose();
		this.output.dispose();
		this._wetDry.dispose();
		this.noiseType.dispose();
		return this;
	}
}
