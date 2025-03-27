/**
 * DelayNode - Tone.js wrapper for a delay/echo audio effect
 *
 * This node wraps a delay AudioWorklet processor within a Tone.js
 * compatible interface, allowing it to seamlessly integrate with Tone.js
 * audio chains.
 */

import * as Tone from 'tone'

import { ToneWorkletBase, ToneWorkletBaseOptions } from './ToneWorkletBase'

/**
 * Options for configuring the DelayNode
 */
export interface DelayNodeOptions extends ToneWorkletBaseOptions {
	/**
	 * Delay time in seconds (or as a Tone.js time value)
	 */
	delayTime: Tone.Unit.Time;

	/**
	 * Feedback amount (0-1)
	 * Controls how much of the delayed signal is fed back into the delay line
	 */
	feedback: number;

	/**
	 * The wet/dry mix of the effect (0-1)
	 * 0 = all dry (no effect), 1 = all wet (full effect)
	 * @default 1
	 */
	wet?: number;
}

/**
 * Delay audio effect with feedback control
 *
 * Creates echo/delay effects by delaying the input signal and
 * optionally feeding part of the output back into the input.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const delay = new DelayNode({ delayTime: 0.5, feedback: 0.6 });
 * signal.connect(delay).toDestination();
 *
 * // Control parameters
 * delay.delayTime.value = 0.75;  // Longer delay
 * delay.feedback.value = 0.3;    // Less feedback
 * delay.wet = 0.5;              // Half wet/half dry
 * ```
 */
export class DelayNode extends ToneWorkletBase<DelayNodeOptions> {
	readonly name: string = 'DelayNode';

	/**
	 * The input node for audio signals
	 */
	readonly input: Tone.Gain;

	/**
	 * The output node for processed audio
	 */
	readonly output: Tone.Gain;

	/**
	 * Parameter controlling the delay time
	 */
	readonly delayTime: Tone.Param<'time'>;

	/**
	 * Parameter controlling the feedback amount (0-1)
	 */
	readonly feedback: Tone.Param<'normalRange'>;

	/**
	 * Internal wet/dry mix control
	 * @private
	 */
	private _wetDry: Tone.CrossFade;

	/**
	 * Create a new DelayNode
	 *
	 * @param options - Configuration options
	 */
	constructor(options: Partial<DelayNodeOptions> = {}) {
		// Merge default options with provided options
		const opts = {
			...DelayNode.getDefaults(),
			...options,
		};

		super(opts);

		// Create I/O nodes
		this.input = new Tone.Gain({ context: this.context });
		this.output = new Tone.Gain({ context: this.context });

		// Create parameter controls
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

		// Create wet/dry mix control
		this._wetDry = new Tone.CrossFade({
			context: this.context,
			fade: opts.wet ?? 1,
		});

		if (this.debug) {
			console.log(
				`🎛️ Created DelayNode with delayTime=${opts.delayTime}, feedback=${opts.feedback}, wet=${opts.wet ?? 1}`
			);
		}
	}

	/**
	 * Provide the name of the AudioWorklet processor to use
	 * @protected
	 */
	protected _audioWorkletName(): string {
		return 'delay-processor';
	}

	/**
	 * Set up connections when the AudioWorkletNode is ready
	 * @param node - The AudioWorkletNode
	 * @protected
	 */
	onReady(node: AudioWorkletNode): void {
		// Connect the wet (processed) path by routing via the worklet
		Tone.connectSeries(this.input, node, this._wetDry.b);

		// Connect the parameters
		const delayTimeParam = node.parameters.get('delayTime');
		const feedbackParam = node.parameters.get('feedback');

		if (delayTimeParam && feedbackParam) {
			this.delayTime.setParam(delayTimeParam);
			this.feedback.setParam(feedbackParam);

			if (this.debug) {
				console.log('✅ Successfully connected delay parameters');
			}
		} else {
			console.error(
				'⚠️ Missing required parameters in delay processor worklet'
			);
		}

		// Connect the dry path and merge with the wet path
		this.input.connect(this._wetDry.a);
		this._wetDry.connect(this.output);

		// Additional debugging
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
	 * Get default DelayNode options
	 */
	static getDefaults(): DelayNodeOptions {
		return Object.assign(ToneWorkletBase.getDefaults(), {
			delayTime: 0.5,
			feedback: 0.5,
			wet: 1,
		});
	}

	/**
	 * Clear the delay buffer immediately
	 * This stops any echoes/repeats that are currently sounding
	 */
	clear(): void {
		if (this._worklet) {
			this._worklet.port.postMessage({ type: 'clear' });

			if (this.debug) {
				console.log('🧽 Cleared delay buffer');
			}
		}
	}

	/**
	 * Get the wet/dry mix value
	 */
	get wet(): number {
		return this._wetDry.fade.value;
	}

	/**
	 * Set the wet/dry mix value
	 * @param value - New wet/dry mix (0-1)
	 */
	set wet(value: number) {
		// Use Tone.js rampTo on the fade parameter if available
		if (typeof this._wetDry.fade.rampTo === 'function') {
		  this._wetDry.fade.rampTo(value, 0.05); // 50ms ramp
		} else {
		  this._wetDry.fade.value = value;
		}
		
		if (this.debug) {
		  console.log(`🔊 Delay wet mix updated: ${value}`);
		}
	  }

	/**
	 * Clean up and release resources
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
