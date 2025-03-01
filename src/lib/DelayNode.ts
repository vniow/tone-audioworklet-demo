// src/lib/DelayNode.ts
import * as Tone from 'tone'

import { ToneWorkletBase, ToneWorkletBaseOptions } from './ToneWorkletBase'

export interface DelayNodeOptions extends Tone.ToneAudioNodeOptions {
	delayTime: Tone.Unit.Time;
	feedback: number;
	wet?: number;
}

export class DelayNode extends ToneWorkletBase<DelayNodeOptions> {
	readonly name: string = 'DelayNode';
	readonly input: Tone.Gain;
	readonly output: Tone.Gain;
	readonly delayTime: Tone.Param<'time'>;
	readonly feedback: Tone.Param<'normalRange'>;
	private _wetDry: Tone.CrossFade;

	constructor(...args: any[]) {
		const opts = Tone.optionsFromArguments(DelayNode.getDefaults(), args);
		super(opts);

		this.input = new Tone.Gain({ context: this.context });
		this.output = new Tone.Gain({ context: this.context });

		this.delayTime = new Tone.Param({
			context: this.context,
			value: opts.delayTime,
			units: 'time',
			param: this._dummyParam,
			swappable: true,
		});

		this.feedback = new Tone.Param({
			context: this.context,
			value: opts.feedback,
			units: 'normalRange',
			param: this._dummyParam,
			swappable: true,
		});

		this._wetDry = new Tone.CrossFade({
			context: this.context,
			fade: opts.wet ?? 1,
		});
	}

	protected _audioWorkletName(): string {
		return 'delay-processor';
	}

	onReady(node: AudioWorkletNode) {
		// Connect the wet (processed) path
		Tone.connectSeries(this.input, node, this._wetDry.b);

		// Connect parameters
		const delayTimeParam = node.parameters.get('delayTime') as AudioParam;
		const feedbackParam = node.parameters.get('feedback') as AudioParam;
		this.delayTime.setParam(delayTimeParam);
		this.feedback.setParam(feedbackParam);

		// Connect the dry path and merge with the wet path
		this.input.connect(this._wetDry.a);
		this._wetDry.connect(this.output);
	}

	static getDefaults(): DelayNodeOptions {
		return Object.assign(Tone.ToneAudioNode.getDefaults(), {
			delayTime: 0.25,
			feedback: 0.5,
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
		this.delayTime.dispose();
		this.feedback.dispose();
		return this;
	}
}
