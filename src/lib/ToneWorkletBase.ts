import * as Tone from 'tone'

import { getWorkletGlobalScope } from './WorkletGlobalScope'

/**
 * error handler for worklet processor errors
 */
const noOp: (e: ErrorEvent) => void = () => {
	// errors are handled by subclasses if needed
};

/**
 * base options for the class
 */
export type ToneWorkletBaseOptions = Tone.ToneAudioNodeOptions & {
	/**
	 * additional options for the AudioWorkletNode
	 */
	workletOptions?: Partial<AudioWorkletNodeOptions>;

	/**
	 * enables additional debug logging
	 * @default false
	 */
	debug?: boolean;
};

/**
 *
 * @template Options - config options type for the node
 * @example
 * ```typescript
TODO
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
	 * needed to create the worklet
	 */
	protected abstract _audioWorkletName(): string;

	/**
	 * called when the AudioWorkletNode is successfully created
	 * use this to connect parameters and set up routing
	 * @param node - The newly created AudioWorkletNode
	 */
	protected abstract onReady(node: AudioWorkletNode): void;

	/**
	 * handler for AudioWorklet processor errors
	 */
	onprocessorerror: (e: ErrorEvent) => void = noOp;

	/**
	 * status of worklet initialization
	 */
	private _workletReady: boolean = false;

	/**
	 * promise that resolves when worklet is ready
	 */
	private _workletReadyPromise: Promise<void>;
	private _workletReadyResolve!: () => void;
	private _workletReadyReject!: (err: Error) => void;

	/**
	 * create a new ToneWorkletBase instance
	 * @param options - Configuration options
	 */
	constructor(options: Options) {
		super(options);

		// set up worklet options if provided
		if (options.workletOptions) {
			this.workletOptions = options.workletOptions;
		}

		// enable debug mode if specified
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

		// init the worklet module
		this._initWorklet();
	}

	/**
	 * init the AudioWorklet module and create the node
	 */
	private _initWorklet(): void {
		const blobUrl = URL.createObjectURL(
			new Blob([getWorkletGlobalScope()], { type: 'text/javascript' })
		);
		const name = this._audioWorkletName();

		if (this.debug) {
			console.log(`🔍 Initializing AudioWorklet: ${name}`);
		}

		// register the processor
		this.context
			.addAudioWorkletModule(blobUrl)
			.then(() => {
				// create the worklet when it's ready
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
	 * get the worklet node
	 * @returns promise that resolves when the worklet is initialized and ready
	 */
	get ready(): Promise<void> {
		return this._workletReadyPromise;
	}

	/**
	 * is the worklet ready
	 * @returns true if the worklet is initialized and ready
	 */
	get isReady(): boolean {
		return this._workletReady;
	}

	/**
	 * cleanup
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
	 * static factory to get default options
	 * @returns default class base options
	 */
	static getDefaults(): ToneWorkletBaseOptions {
		return Object.assign(Tone.ToneAudioNode.getDefaults(), {
			debug: false,
		});
	}
}
