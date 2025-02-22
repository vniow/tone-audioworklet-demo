import * as Tone from 'tone'

// import { useAudioStore } from '../stores/audioStore'

const registeredWorklets = new Set<string>();

interface ToneWorkletOptions extends Tone.ToneAudioNodeOptions {
	workletUrl: string;
	processorName: string;
}

export class BlarghWorkletWrapper extends Tone.ToneAudioNode<ToneWorkletOptions> {
	readonly name = 'BlarghWorkletWrapper';
	readonly input: Tone.Gain;
	readonly output: Tone.Gain;

	private _ready = Promise.resolve();
	private _isInitialized = false;
	private _isPlaying = false;
	private _worklet: AudioWorkletNode | null = null;

	constructor(options: Partial<ToneWorkletOptions> = {}) {
		super({ context: Tone.getContext() || undefined, ...options });

		this.input = new Tone.Gain({ context: this.context });
		this.output = new Tone.Gain({ context: this.context });

		if (options.workletUrl && options.processorName) {
			this._ready = this._initWorklet(options.workletUrl, options.processorName);
		} else {
			console.warn('[BlarghWorkletWrapper] Missing workletUrl or processorName in options');
		}
	}

	private async _initWorklet(workletUrl: string, processorName: string): Promise<void> {
		try {
			// Only register the worklet if it hasn't been registered before
			if (!registeredWorklets.has(processorName)) {
				await this.context.addAudioWorkletModule(workletUrl);
				registeredWorklets.add(processorName);
			} else {
				console.log(`[BlarghWorkletWrapper] Worklet ${processorName} already registered, skipping registration`);
			}

			this._worklet = this.context.createAudioWorkletNode(processorName);

			// Setup detailed log for message handler
			this._worklet.port.onmessage = (event) => {
				if (event.data.type === 'stateChange') {
					this._isPlaying = event.data.isPlaying;
				}
			};

			this.input.chain(this._worklet, this.output);

			this._isInitialized = true;
		} catch (error) {
			console.error(
				`[BlarghWorkletWrapper] _initWorklet failed at workletUrl: ${workletUrl}, processor: ${processorName}`
			);
			console.error(`[BlarghWorkletWrapper] Context state at failure: ${this.context.state}`);
			console.error(`[BlarghWorkletWrapper] Error details:`, error);
			if (error instanceof DOMException) {
				console.error(`[BlarghWorkletWrapper] DOMException name:`, error.name);
				console.error(`[BlarghWorkletWrapper] DOMException message:`, error.message);
				console.error(`[BlarghWorkletWrapper] Currently registered worklets:`, Array.from(registeredWorklets));
			}
			throw new Error(`Failed to initialize worklet: ${error}`);
		}
	}

	get isInitialized(): boolean {
		return this._isInitialized;
	}

	get isPlaying(): boolean {
		return this._isPlaying;
	}

	async start(): Promise<this> {
		if (!this._isInitialized || !this._worklet) {
			throw new Error('Worklet not initialized');
		}
		await Tone.start();
		this._worklet.port.postMessage({ type: 'toggle', active: true });
		this._isPlaying = true;
		return this;
	}

	async stop(): Promise<this> {
		if (!this._worklet) {
			throw new Error('Worklet not initialized');
		}
		this._worklet.port.postMessage({ type: 'toggle', active: false });
		this._isPlaying = false;
		return this;
	}

	async toggle(): Promise<this> {
		if (this._isPlaying) {
			return this.stop();
		}
		return this.start();
	}

	setParam(name: string, value: number): this {
		if (!this._worklet) {
			throw new Error('Worklet not initialized');
		}
		this._worklet.port.postMessage({ type: name, value });
		return this;
	}

	dispose(): this {
		super.dispose();
		if (this._worklet) {
			// Don't remove from registeredWorklets on dispose - other instances might still need it
			this._worklet.disconnect();
			this._worklet = null;
		}
		this.input.dispose();
		this.output.dispose();
		this._isInitialized = false;
		this._isPlaying = false;
		return this;
	}
}
