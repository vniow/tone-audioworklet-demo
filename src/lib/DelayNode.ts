/**
 * DelayNode - Tone.js wrapper for a delay/echo audio effect
 *
 * Creates echo/delay effects by delaying the input signal and
 * optionally feeding part of the output back into the input.
 */

import * as Tone from 'tone'

import { ToneWorkletBase, ToneWorkletBaseOptions } from './ToneWorkletBase'

/**
 * config options for the DelayNode
 */
export interface DelayNodeOptions extends ToneWorkletBaseOptions {
	/**
	 * delay time in seconds (or as a Tone.js time value)
	 */
	delayTime: Tone.Unit.Time;

	/**
	 * feedback amount (0-1)
	 * controls how much of the delayed signal is fed back into the delay line
	 */
	feedback: number;

	/**
	 * the wet/dry mix of the effect (0-1)
	 * 0 = all dry (no effect), 1 = all wet (full effect)
	 * @default 1
	 */
	wet?: number;
}

/**
 * delay audio effect with feedback control
 *
 *
 * @example
 * ```typescript
 * // basic usage
 * const delay = new DelayNode({ delayTime: 0.5, feedback: 0.6 });
 * signal.connect(delay).toDestination();
 *
 * // control parameters
 * delay.delayTime.value = 0.75;  // Longer delay
 * delay.feedback.value = 0.3;    // Less feedback
 * delay.wet = 0.5;              // Half wet/half dry
 * ```
 */
export class DelayNode extends ToneWorkletBase<DelayNodeOptions> {
	readonly name: string = 'DelayNode';

	/**
	 * input node for audio signals
	 */
	readonly input: Tone.Gain;

	/**
	 * output node for processed audio
	 */
	readonly output: Tone.Gain;

	/**
	 * parameter controlling the delay time
	 */
	readonly delayTime: Tone.Param<'time'>;

	/**
	 * parameter controlling the feedback amount (0-1)
	 */
	readonly feedback: Tone.Param<'normalRange'>;

	/**
	 * internal wet/dry mix control
	 * @private
	 */
	private _wetDry: Tone.CrossFade;

	/**
	 * create a new DelayNode
	 *
	 * @param options - configuration options
	 */
	constructor(options: Partial<DelayNodeOptions> = {}) {
		// merge default options with provided options
		const opts = {
			...DelayNode.getDefaults(),
			...options,
		};

		super(opts);

		// create I/O nodes
		this.input = new Tone.Gain({ context: this.context });
		this.output = new Tone.Gain({ context: this.context });

		// create parameter controls
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

		// create wet/dry mix control
		this._wetDry = new Tone.CrossFade({
			context: this.context,
			fade: opts.wet ?? 1,
		});

		if (this.debug) {
			console.log(
				`🎛️ created DelayNode with delayTime=${opts.delayTime}, feedback=${opts.feedback}, wet=${opts.wet ?? 1}`
			);
		}
	}

	/**
	 * provide the name of the AudioWorklet processor to use
	 * @protected
	 */
	protected _audioWorkletName(): string {
		return 'delay-processor';
	}

	/**
	 * set up connections when the AudioWorkletNode is ready
	 * @param node - AudioWorkletNode
	 * @protected
	 */
	onReady(node: AudioWorkletNode): void {
		// connect the wet (processed) path by routing via the worklet
		Tone.connectSeries(this.input, node, this._wetDry.b);

		// Connect the parameters
		const delayTimeParam = node.parameters.get('delayTime');
		const feedbackParam = node.parameters.get('feedback');

		if (delayTimeParam && feedbackParam) {
			this.delayTime.setParam(delayTimeParam);
			this.feedback.setParam(feedbackParam);

			if (this.debug) {
				console.log('✅ successfully connected delay parameters');
			}
		} else {
			console.error(
				'⚠️ missing required parameters in delay processor worklet'
			);
		}

		// connect the dry path and merge with the wet path
		this.input.connect(this._wetDry.a);
		this._wetDry.connect(this.output);

		// additional debugging
		if (this.debug) {
			console.log('✅ Delay node setup complete:', {
				delayTime: this.delayTime.value,
				feedback: this.feedback.value,
				wet: this._wetDry.fade.value,
				context: this.context.state,
			});
		}
	}

	/**
	 * get default DelayNode options
	 */
	static getDefaults(): DelayNodeOptions {
		return Object.assign(ToneWorkletBase.getDefaults(), {
			delayTime: 0.5,
			feedback: 0.5,
			wet: 1,
		});
	}

	/**
	 * clear the delay buffer immediately
	 * this stops any echoes/repeats that are currently sounding
	 */
	clear(): void {
		if (this._worklet) {
			this._worklet.port.postMessage({ type: 'clear' });

			if (this.debug) {
				console.log('🧽 cleared delay buffer');
			}
		}
	}

	/**
	 * get the wet/dry mix value
	 */
	get wet(): number {
		return this._wetDry.fade.value;
	}

	/**
	 * set the wet/dry mix value
	 * @param value - new wet/dry mix (0-1)
	 */
	set wet(value: number) {
		// use Tone.js rampTo on the fade parameter if available
		if (typeof this._wetDry.fade.rampTo === 'function') {
			this._wetDry.fade.rampTo(value, 0.05); // 50ms ramp
		} else {
			this._wetDry.fade.value = value;
		}

		if (this.debug) {
			console.log(`🔊 delay wet mix updated: ${value}`);
		}
	}

	/**
	 * clean up and release resources
	 */
	dispose(): this {
		super.dispose();
		this.input.dispose();
		this.output.dispose();
		this._wetDry.dispose();
		this.delayTime.dispose();
		this.feedback.dispose();

		if (this.debug) {
			console.log('🧹 Delay node disposed');
		}

		return this;
	}
}
