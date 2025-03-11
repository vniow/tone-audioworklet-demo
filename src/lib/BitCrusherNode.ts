/**
 * BitCrusherNode - Tone.js wrapper for a bit crusher audio effect
 *
 * This node wraps a bit crusher AudioWorklet processor within a Tone.js
 * compatible interface, allowing it to seamlessly integrate with Tone.js
 * audio chains.
 */

import * as Tone from 'tone'

import { ToneWorkletBase, ToneWorkletBaseOptions } from './ToneWorkletBase'

/**
 * Options for configuring the BitCrusherNode
 */
export interface BitCrusherNodeOptions extends ToneWorkletBaseOptions {
	/**
	 * The bit depth of the effect (1-16)
	 * Lower values create more extreme crushing effects
	 */
	bits: Tone.Unit.Positive;

	/**
	 * The wet/dry mix of the effect (0-1)
	 * 0 = all dry (no effect), 1 = all wet (full effect)
	 * @default 1
	 */
	wet?: number;
}

/**
 * Bit crusher audio effect that reduces the bit depth of the signal.
 *
 * This creates a lo-fi, distorted sound by reducing the resolution
 * of the audio signal.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const crusher = new BitCrusherNode({ bits: 4, wet: 0.7 });
 * signal.connect(crusher).toDestination();
 *
 * // Control parameters
 * crusher.bits.value = 2; // Extreme bit crush
 * crusher.wet = 0.5;     // Half wet/half dry
 * ```
 */
export class BitCrusherNode extends ToneWorkletBase<BitCrusherNodeOptions> {
	readonly name: string = 'BitCrusherNode';

	/**
	 * The input node for audio signals
	 */
	readonly input: Tone.Gain;

	/**
	 * The output node for processed audio
	 */
	readonly output: Tone.Gain;

	/**
	 * Parameter controlling the bit depth of the effect (1-16)
	 */
	readonly bits: Tone.Param<'positive'>;

	/**
	 * Internal wet/dry mix control
	 * @private
	 */
	private _wetDry: Tone.CrossFade;

	/**
	 * Create a new BitCrusherNode
	 *
	 * @param options - Configuration options
	 */
	constructor(options: Partial<BitCrusherNodeOptions> = {}) {
		// Merge default options with provided options
		const opts = {
			...BitCrusherNode.getDefaults(),
			...options,
		};

		super(opts);

		// Create I/O nodes
		this.input = new Tone.Gain({ context: this.context });
		this.output = new Tone.Gain({ context: this.context });

		// Create the bits parameter
		this.bits = new Tone.Param<'positive'>({
			context: this.context,
			value: opts.bits,
			units: 'positive',
			minValue: 1,
			maxValue: 16,
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
				`🎛️ Created BitCrusherNode with bits=${opts.bits}, wet=${opts.wet ?? 1}`
			);
		}
	}

	/**
	 * Provide the name of the AudioWorklet processor to use
	 * @protected
	 */
	protected _audioWorkletName(): string {
		return 'bit-crusher';
	}

	/**
	 * Set up connections when the AudioWorkletNode is ready
	 * @param node - The AudioWorkletNode
	 * @protected
	 */
	onReady(node: AudioWorkletNode): void {
		// Connect the wet (processed) path by routing via the worklet
		Tone.connectSeries(this.input, node, this._wetDry.b);

		// Connect the parameter
		const bitsParam = node.parameters.get('bits');
		if (bitsParam) {
			this.bits.setParam(bitsParam);

			if (this.debug) {
				console.log(
					`✅ Connected BitCrusher bits parameter: ${this.bits.value}`
				);
			}
		} else {
			console.warn('⚠️ Failed to get bits parameter from BitCrusher worklet');
		}

		// Connect the dry path and merge with the wet path
		this.input.connect(this._wetDry.a);
		this._wetDry.connect(this.output);

		if (this.debug) {
			console.log('✅ BitCrusher signal routing established');
		}
	}

	/**
	 * Get default BitCrusherNode options
	 */
	static getDefaults(): BitCrusherNodeOptions {
		return Object.assign(ToneWorkletBase.getDefaults(), {
			bits: 4,
			wet: 1,
		});
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
		this._wetDry.fade.value = value;

		if (this.debug) {
			console.log(`🔊 BitCrusher wet mix updated: ${value}`);
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
		this.bits.dispose();

		if (this.debug) {
			console.log('🧹 BitCrusher node disposed');
		}

		return this;
	}
}
