import * as Tone from 'tone'

import { ToneWorkletBase, ToneWorkletBaseOptions } from './ToneWorkletBase'

export interface BitCrusherNodeOptions extends Tone.ToneAudioNodeOptions {
	bits: Tone.Unit.Positive;
	wet?: number;
}
export interface BitCrusherNodeWorkletOptions extends ToneWorkletBaseOptions {
	bits: number;
}



export class BitCrusherNode extends ToneWorkletBase<BitCrusherNodeOptions> {
	readonly name: string = 'BitCrusherNode';
	readonly input: Tone.Gain;
	readonly output: Tone.Gain;
	readonly bits: Tone.Param<'positive'>;
	private _wetDry: Tone.CrossFade;

	constructor(options: Partial<BitCrusherNodeOptions> = {}) {
		const opts = Tone.optionsFromArguments(BitCrusherNode.getDefaults(), [options]);
		super(opts);

		this.input = new Tone.Gain({ context: this.context });
		this.output = new Tone.Gain({ context: this.context });
		this.bits = new Tone.Param<'positive'>({
			context: this.context,
			value: opts.bits,
			units: 'positive',
			minValue: 1,
			maxValue: 16,
			param: this._dummyParam,
			swappable: true,
		});
		this._wetDry = new Tone.CrossFade({
			context: this.context,
			fade: opts.wet ?? 1,
		});
	}

	protected _audioWorkletName(): string {
		return 'bit-crusher';
	}

	onReady(node: AudioWorkletNode) {
		// Connect the wet (processed) path by routing via the worklet
		Tone.connectSeries(this.input, node, this._wetDry.b);
		const bitsParam = node.parameters.get('bits') as AudioParam;
		this.bits.setParam(bitsParam);
		// Connect the dry path and merge with the wet path
		this.input.connect(this._wetDry.a);
		this._wetDry.connect(this.output);
	}

	static getDefaults(): BitCrusherNodeOptions {
		return Object.assign(Tone.ToneAudioNode.getDefaults(), {
			bits: 4,
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
		this.bits.dispose();
		return this;
	}
}


