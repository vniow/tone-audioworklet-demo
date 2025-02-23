import * as Tone from 'tone'
import { Positive } from 'tone/build/esm/core/type/Units'
import { Effect, EffectOptions } from 'tone/build/esm/effect/Effect'

import { workletName } from '../worklets/bitcrusher-worklet'
import { ToneWorkletBase, ToneWorkletBaseOptions } from './ToneWorkletBase'

export interface BitCrusherTestOptions extends EffectOptions {
	bits: Positive;
}
export class BitCrusherTest extends Effect<BitCrusherTestOptions> {
	readonly name: string = 'BitCrusherTest';

	readonly bits: Tone.Param<'positive'>;

	private _bitCrusherTestWorklet: BitCrusherTestWorklet;

	constructor(bits?: Positive);
	constructor(options?: Partial<BitCrusherTestWorkletOptions>);
	constructor() {
		const options = Tone.optionsFromArguments(BitCrusherTest.getDefaults(), arguments, ['bits']);
		super(options);

		this._bitCrusherTestWorklet = new BitCrusherTestWorklet({
			context: this.context,
			bits: options.bits,
		});
		// connect it up
		this.connectEffect(this._bitCrusherTestWorklet);

		this.bits = this._bitCrusherTestWorklet.bits;
	}

	static getDefaults(): BitCrusherTestOptions {
		return Object.assign(Effect.getDefaults(), {
			bits: 4,
		});
	}

	dispose(): this {
		super.dispose();
		this._bitCrusherTestWorklet.dispose();
		return this;
	}
}

interface BitCrusherTestWorkletOptions extends ToneWorkletBaseOptions {
	bits: number;
}

/**
 * Internal class which creates an AudioWorklet to do the bit crushing
 */
class BitCrusherTestWorklet extends ToneWorkletBase<BitCrusherTestWorkletOptions> {
	readonly name: string = 'BitCrusherTestWorklet';

	readonly input: Tone.Gain;
	readonly output: Tone.Gain;

	readonly bits: Tone.Param<'positive'>;

	constructor(options?: Partial<BitCrusherTestWorkletOptions>);
	constructor() {
		const options = Tone.optionsFromArguments(BitCrusherTestWorklet.getDefaults(), arguments);
		super(options);

		this.input = new Tone.Gain({ context: this.context });
		this.output = new Tone.Gain({ context: this.context });

		this.bits = new Tone.Param<'positive'>({
			context: this.context,
			value: options.bits,
			units: 'positive',
			minValue: 1,
			maxValue: 16,
			param: this._dummyParam,
			swappable: true,
		});
	}

	static getDefaults(): BitCrusherTestWorkletOptions {
		return Object.assign(ToneWorkletBase.getDefaults(), {
			bits: 12,
		});
	}

	protected _audioWorkletName(): string {
		return workletName;
	}

	onReady(node: AudioWorkletNode) {
		Tone.connectSeries(this.input, node, this.output);
		const bits = node.parameters.get('bits') as AudioParam;
		this.bits.setParam(bits);
	}

	dispose(): this {
		super.dispose();
		this.input.dispose();
		this.output.dispose();
		this.bits.dispose();
		return this;
	}
}
