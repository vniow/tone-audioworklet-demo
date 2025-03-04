import * as Tone from 'tone'

import { ToneWorkletBase, ToneWorkletBaseOptions } from './ToneWorkletBase'

export interface NoiseGeneratorNodeOptions extends Tone.ToneAudioNodeOptions {
	amplitude: number;
	type: number; // 0 = white, 1 = pink, 2 = brown
	wet?: number;
}

export interface NoiseGeneratorWorkletOptions extends ToneWorkletBaseOptions {
	amplitude: number;
	type: number;
}

export class NoiseGeneratorNode extends ToneWorkletBase<NoiseGeneratorNodeOptions> {
	readonly name: string = 'NoiseGeneratorNode';
	readonly input: Tone.Gain;
	readonly output: Tone.Gain;
	readonly amplitude: Tone.Param<'normalRange'>;
	readonly type: Tone.Param<'positive'>;
	private _wetDry: Tone.CrossFade;

	constructor(...args: any[]) {
		const opts = Tone.optionsFromArguments(NoiseGeneratorNode.getDefaults(), args);
		super(opts);

		this.input = new Tone.Gain({ context: this.context });
		this.output = new Tone.Gain({ context: this.context });

		this.amplitude = new Tone.Param<'normalRange'>({
			context: this.context,
			value: opts.amplitude,
			units: 'normalRange',
			minValue: 0,
			maxValue: 1,
			param: this._dummyParam,
			swappable: true,
		});

		this.type = new Tone.Param<'positive'>({
			context: this.context,
			value: opts.type,
			units: 'positive',
			minValue: 0,
			maxValue: 2,
			param: this._dummyParam,
			swappable: true,
		});

		this._wetDry = new Tone.CrossFade({
			context: this.context,
			fade: opts.wet ?? 1,
		});
	}

	protected _audioWorkletName(): string {
		return 'noise-generator';
	}

	onReady(node: AudioWorkletNode) {
		// Connect the wet (processed) path
		Tone.connectSeries(this.input, node, this._wetDry.b);

		// Connect parameters
		const amplitudeParam = node.parameters.get('amplitude') as AudioParam;
		const typeParam = node.parameters.get('type') as AudioParam;
		this.amplitude.setParam(amplitudeParam);
		this.type.setParam(typeParam);

		// Connect the dry path and merge with the wet path
		this.input.connect(this._wetDry.a);
		this._wetDry.connect(this.output);
	}

	static getDefaults(): NoiseGeneratorNodeOptions {
		return Object.assign(Tone.ToneAudioNode.getDefaults(), {
			amplitude: 0.5,
			type: 0,
			wet: 1,
		});
	}

	get wet(): number {
		return this._wetDry.fade.value;
	}

	set wet(value: number) {
		this._wetDry.fade.value = value;
	}

	dispose(): this {
		super.dispose();
		this.input.dispose();
		this.output.dispose();
		this._wetDry.dispose();
		this.amplitude.dispose();
		this.type.dispose();
		return this;
	}
}
