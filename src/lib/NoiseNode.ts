/**
 * NoiseNode - Tone.js wrapper for a white noise generator
 *
 * wraps a noise generator AudioWorklet processor within a Tone.js context
 */
import * as Tone from 'tone'

import { ToneWorkletBase, ToneWorkletBaseOptions } from './ToneWorkletBase'

/**
 * options for configuring the NoiseNode
 */
export interface NoiseNodeOptions extends ToneWorkletBaseOptions {
	/**
	 * whether to start generating noise immediately
	 * @default false
	 */
	autostart?: boolean;
}

/**
 * white noise generator audio node
 *
 * @example
 * ```typescript
 * // basic usage
 * const noise = new NoiseNode();
 * const gainNode = new Tone.Gain(0.5).toDestination();
 * noise.connect(gainNode);
 * noise.start();
 *
 * // stop noise
 * noise.stop();
 * ```
 */
export class NoiseNode extends ToneWorkletBase<NoiseNodeOptions> {
	readonly name: string = 'NoiseNode';

	/**
	 * because this is a generator, the input is not used
	 */
	readonly input: undefined = undefined;

	/**
	 * output for processed audio
	 */
	readonly output: Tone.Gain;

	/**
	 * boolean to track if the noise is currently playing
	 * @private
	 */
	private _isPlaying: boolean = false;

	/**
	 * create a new NoiseNode
	 *
	 * @param options - config options
	 */
	constructor(options: Partial<NoiseNodeOptions> = {}) {
		// merge default options with provided options
		const opts = {
			...NoiseNode.getDefaults(),
			...options,
		};

		super(opts);

		// create output node
		this.output = new Tone.Gain({ context: this.context });

		if (this.debug) {
			console.log(`🎛️ created WhiteNoiseNode`);
		}

		// auto-start if requested
		if (opts.autostart) {
			this.ready.then(() => {
				this.start();
			});
		}
	}

	/**
	 * provide the name of the AudioWorklet processor to use
	 * @protected
	 */
	protected _audioWorkletName(): string {
		return 'noise-processor';
	}

	/**
	 * set up connections when the AudioWorkletNode is ready
	 * @param node - AudioWorkletNode
	 * @protected
	 */
	onReady(node: AudioWorkletNode): void {
		// connect the output
		Tone.connect(node, this.output);

		// additional debugging
		if (this.debug) {
			console.log('✅ White noise node setup complete');
		}
	}

	/**
	 * start generating noise
	 * @returns this
	 */
	start(): this {
		if (this._worklet && !this._isPlaying) {
			this._worklet.port.postMessage({ type: 'start' });
			this._isPlaying = true;

			if (this.debug) {
				console.log('▶️ Starting white noise generation');
			}
		}
		return this;
	}

	/**
	 * stop generating noise
	 * @returns this
	 */
	stop(): this {
		if (this._worklet && this._isPlaying) {
			this._worklet.port.postMessage({ type: 'stop' });
			this._isPlaying = false;

			if (this.debug) {
				console.log('⏹️ Stopping noise generation');
			}
		}
		return this;
	}

	/**
	 * check if noise is currently playing
	 */
	get isPlaying(): boolean {
		return this._isPlaying;
	}

	/**
	 * get default NoiseNode options
	 */
	static getDefaults(): NoiseNodeOptions {
		return Object.assign(ToneWorkletBase.getDefaults(), {
			autostart: false,
		});
	}

	/**
	 * clean up and release resources
	 */
	dispose(): this {
		super.dispose();

		// stop noise generation first
		if (this._isPlaying) {
			this.stop();
		}

		this.output.dispose();

		if (this.debug) {
			console.log('🧹 noise node disposed');
		}

		return this;
	}
}
