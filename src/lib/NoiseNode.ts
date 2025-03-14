/**
 * NoiseNode - Tone.js wrapper for a white noise generator
 *
 * This node wraps a white noise generator AudioWorklet processor within a Tone.js
 * compatible interface, allowing it to seamlessly integrate with Tone.js
 * audio chains.
 */
import * as Tone from 'tone'

import { ToneWorkletBase, ToneWorkletBaseOptions } from './ToneWorkletBase'

/**
 * Options for configuring the NoiseNode
 */
export interface NoiseNodeOptions extends ToneWorkletBaseOptions {
	/**
	 * Whether to start generating noise immediately
	 * @default false
	 */
	autostart?: boolean;
}

/**
 * White noise generator audio node.
 *
 * Volume control should be handled externally with a GainNode.
 *
 * @example
 * ```typescript
 * // Basic usage
 * const noise = new NoiseNode();
 * const gainNode = new Tone.Gain(0.5).toDestination();
 * noise.connect(gainNode);
 * noise.start();
 *
 * // Stop noise
 * noise.stop();
 * ```
 */
export class NoiseNode extends ToneWorkletBase<NoiseNodeOptions> {
	readonly name: string = 'NoiseNode';

	/**
	 * This node doesn't process input, so input is undefined
	 */
	readonly input: undefined = undefined;

	/**
	 * The output node for processed audio
	 */
	readonly output: Tone.Gain;

	/**
	 * Whether the noise generator is currently playing
	 * @private
	 */
	private _isPlaying: boolean = false;

	/**
	 * Create a new NoiseNode
	 *
	 * @param options - Configuration options
	 */
	constructor(options: Partial<NoiseNodeOptions> = {}) {
		// Merge default options with provided options
		const opts = {
			...NoiseNode.getDefaults(),
			...options,
		};

		super(opts);

		// Create output node
		this.output = new Tone.Gain({ context: this.context });

		if (this.debug) {
			console.log(`🎛️ Created WhiteNoiseNode`);
		}

		// Auto-start if requested
		if (opts.autostart) {
			this.ready.then(() => {
				this.start();
			});
		}
	}

	/**
	 * Provide the name of the AudioWorklet processor to use
	 * @protected
	 */
	protected _audioWorkletName(): string {
		return 'noise-processor';
	}

	/**
	 * Set up connections when the AudioWorkletNode is ready
	 * @param node - The AudioWorkletNode
	 * @protected
	 */
	onReady(node: AudioWorkletNode): void {
		// Connect the output
		Tone.connect(node, this.output);

		// Additional debugging
		if (this.debug) {
			console.log('✅ White noise node setup complete');
		}
	}

	/**
	 * Start generating noise
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
	 * Stop generating noise
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
	 * Check if noise is currently playing
	 */
	get isPlaying(): boolean {
		return this._isPlaying;
	}

	/**
	 * Get default NoiseNode options
	 */
	static getDefaults(): NoiseNodeOptions {
		return Object.assign(ToneWorkletBase.getDefaults(), {
			autostart: false,
		});
	}

	/**
	 * Clean up and release resources
	 */
	dispose(): this {
		super.dispose();

		// Stop noise generation first
		if (this._isPlaying) {
			this.stop();
		}

		this.output.dispose();

		if (this.debug) {
			console.log('🧹 Noise node disposed');
		}

		return this;
	}
}
