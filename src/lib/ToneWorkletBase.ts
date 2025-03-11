// minorly refactored wrapper around Tone's ToneAudioWorkletNode
import * as Tone from 'tone'

import { getWorkletGlobalScope } from './WorkletGlobalScope'

/**
 * Default no-operation error handler for processor errors
 */
const noOp: (e: ErrorEvent) => void = () => {
	// No operation by default - errors are handled by subclasses if needed
};

/**
 * Base options for ToneWorklet classes
 */
export type ToneWorkletBaseOptions = Tone.ToneAudioNodeOptions & {
	/**
	 * Additional AudioWorklet options for configuring the underlying AudioWorkletNode
	 */
	workletOptions?: Partial<AudioWorkletNodeOptions>;

	/**
	 * Debug mode enables additional console logging
	 * @default false
	 */
	debug?: boolean;
};

/**
 * Base class for creating Tone.js compatible AudioWorklet nodes
 *
 * This abstract class provides the core functionality for integrating
 * custom AudioWorklet processors with the Tone.js API. It handles the
 * lifecycle of AudioWorklet initialization, parameter management, and
 * proper cleanup.
 *
 * @template Options - Configuration options type for the node
 * @example
 * ```typescript
 * // Implementation example
 * export class CustomNode extends ToneWorkletBase<CustomOptions> {
 *   readonly name = 'CustomNode';
 *
 *   protected _audioWorkletName(): string {
 *     return 'custom-processor';
 *   }
 *
 *   onReady(node: AudioWorkletNode): void {
 *     // Connect parameters and set up routing
 *   }
 * }
 * ```
 */
export abstract class ToneWorkletBase<
	Options extends ToneWorkletBaseOptions,
> extends Tone.ToneAudioNode<Options> {
	readonly name: string = 'ToneWorkletBase';
	protected _worklet!: AudioWorkletNode;
	private _dummyGain: GainNode;
	protected _dummyParam: AudioParam;
	protected workletOptions: Partial<AudioWorkletNodeOptions> = {};
	// protected debug: boolean = false;

	/**
	 * Must be implemented to return the registered name of the AudioWorklet processor
	 */
	protected abstract _audioWorkletName(): string;

	/**
	 * Called when the AudioWorkletNode is successfully created
	 * Use this to connect parameters and set up routing
	 * @param node - The newly created AudioWorkletNode
	 */
	protected abstract onReady(node: AudioWorkletNode): void;

	/**
	 * Handler for AudioWorklet processor errors
	 */
	onprocessorerror: (e: ErrorEvent) => void = noOp;

	/**
	 * Status of worklet initialization
	 */
	private _workletReady: boolean = false;

	/**
	 * Promise that resolves when worklet is ready
	 */
	private _workletReadyPromise: Promise<void>;
	private _workletReadyResolve!: () => void;
	private _workletReadyReject!: (err: Error) => void;

	/**
	 * Create a new ToneWorkletBase instance
	 * @param options - Configuration options
	 */
	constructor(options: Options) {
		super(options);

		// Set up worklet options if provided
		if (options.workletOptions) {
			this.workletOptions = options.workletOptions;
		}

		// Enable debug mode if specified
		if (options.debug) {
			this.debug = true;
		}

		this._dummyGain = this.context.createGain();
		this._dummyParam = this._dummyGain.gain;

		// Create promise for worklet readiness
		this._workletReadyPromise = new Promise<void>((resolve, reject) => {
			this._workletReadyResolve = resolve;
			this._workletReadyReject = reject;
		});

		// Initialize the worklet module
		this._initWorklet();
	}

	/**
	 * Initialize the AudioWorklet module and create the node
	 */
	private _initWorklet(): void {
		const blobUrl = URL.createObjectURL(
			new Blob([getWorkletGlobalScope()], { type: 'text/javascript' })
		);
		const name = this._audioWorkletName();

		if (this.debug) {
			console.log(`🔍 Initializing AudioWorklet: ${name}`);
		}

		// Register the processor
		this.context
			.addAudioWorkletModule(blobUrl)
			.then(() => {
				// Create the worklet when it's ready
				if (!this.disposed) {
					try {
						this._worklet = this.context.createAudioWorkletNode(
							name,
							this.workletOptions
						);
						this._worklet.onprocessorerror = (e: ErrorEvent) => {
							if (this.debug) {
								console.error(`⚠️ AudioWorklet processor error in ${name}:`, e);
							}
							this.onprocessorerror(e);
						};
						this.onReady(this._worklet);
						this._workletReady = true;
						this._workletReadyResolve();

						if (this.debug) {
							console.log(`✅ AudioWorklet node ready: ${name}`);
						}
					} catch (err) {
						const error = err instanceof Error ? err : new Error(String(err));
						if (this.debug) {
							console.error(
								`❌ Failed to create AudioWorklet node ${name}:`,
								error
							);
						}
						this._workletReadyReject(error);
					}
				}
			})
			.catch((err) => {
				if (this.debug) {
					console.error(`❌ Failed to add AudioWorklet module ${name}:`, err);
				}
				this._workletReadyReject(err);
				URL.revokeObjectURL(blobUrl); // Clean up the URL
			});
	}

	/**
	 * Returns a promise that resolves when the worklet is ready
	 * @returns Promise that resolves when the worklet is initialized and ready
	 */
	get ready(): Promise<void> {
		return this._workletReadyPromise;
	}

	/**
	 * Checks if the worklet is ready
	 * @returns True if the worklet is initialized and ready
	 */
	get isReady(): boolean {
		return this._workletReady;
	}

	/**
	 * Clean up and release resources
	 */
	dispose(): this {
		if (this.debug) {
			console.log(`🧹 Disposing ${this.name} worklet`);
		}

		super.dispose();
		this._dummyGain.disconnect();

		if (this._worklet) {
			this._worklet.port.postMessage('dispose');
			this._worklet.disconnect();
		}

		return this;
	}

	/**
	 * Static factory to get default options
	 * @returns Default base options
	 */
	static getDefaults(): ToneWorkletBaseOptions {
		return Object.assign(Tone.ToneAudioNode.getDefaults(), {
			debug: false,
		});
	}
}
