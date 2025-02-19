import * as Tone from 'tone'

import { useAudioStore } from '../stores/audioStore'

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
		super({ context: useAudioStore.getState().context || undefined, ...options });
		console.log(`[BlarghWorkletWrapper] Constructor called with options:`, options);
		console.log(`[BlarghWorkletWrapper] AudioContext state:`, this.context.state);
		console.log(`[BlarghWorkletWrapper] AudioContext sample rate:`, this.context.sampleRate);

		this.input = new Tone.Gain({ context: this.context });
		this.output = new Tone.Gain({ context: this.context });

		if (options.workletUrl && options.processorName) {
			console.log(
				`[BlarghWorkletWrapper] Initializing worklet with URL: ${options.workletUrl} and processor: ${options.processorName}`
			);
			this._ready = this._initWorklet(options.workletUrl, options.processorName);
		} else {
			console.warn('[BlarghWorkletWrapper] Missing workletUrl or processorName in options');
		}
	}

	private async _initWorklet(workletUrl: string, processorName: string): Promise<void> {
		console.log(
			`[BlarghWorkletWrapper] ==> _initWorklet called with workletUrl: ${workletUrl}, processorName: ${processorName}`
		);
		console.log(`[BlarghWorkletWrapper] Current context state before module add: ${this.context.state}`);
		console.log(`[BlarghWorkletWrapper] AudioContext details: sampleRate: ${this.context.sampleRate}`);
		try {
			// Only register the worklet if it hasn't been registered before
			if (!registeredWorklets.has(processorName)) {
				console.log(`[BlarghWorkletWrapper] Registering new worklet module: ${processorName}`);
				await this.context.addAudioWorkletModule(workletUrl);
				registeredWorklets.add(processorName);
				console.log(`[BlarghWorkletWrapper] Successfully registered worklet: ${processorName}`);
			} else {
				console.log(`[BlarghWorkletWrapper] Worklet ${processorName} already registered, skipping registration`);
			}

			console.log(`[BlarghWorkletWrapper] Attempting to create AudioWorkletNode with processor: ${processorName}`);
			this._worklet = this.context.createAudioWorkletNode(processorName);
			console.log(`[BlarghWorkletWrapper] AudioWorkletNode created successfully:`, this._worklet);

			// Setup detailed log for message handler
			this._worklet.port.onmessage = (event) => {
				console.log(`[BlarghWorkletWrapper] Received worklet message:`, event.data);
				if (event.data.type === 'stateChange') {
					this._isPlaying = event.data.isPlaying;
					console.log(`[BlarghWorkletWrapper] Updated internal _isPlaying to: ${this._isPlaying}`);
				}
			};

			console.log(`[BlarghWorkletWrapper] Connecting input -> worklet -> output nodes...`);
			this.input.chain(this._worklet, this.output);
			console.log(`[BlarghWorkletWrapper] Audio nodes connected`);

			this._isInitialized = true;
			console.log(`[BlarghWorkletWrapper] _initWorklet completed successfully`);
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
