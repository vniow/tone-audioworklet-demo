import * as Tone from 'tone'

import { audioContext } from '../utils/audioContext'

interface FilteredNoiseNodeOptions {
	context: Tone.Context;
}

export class FilteredNoiseNode extends Tone.ToneAudioNode<FilteredNoiseNodeOptions> {
	readonly name = 'FilteredNoiseNode';

	private _worklet: AudioWorkletNode | null = null;
	private _isInitialized = false;
	private _gainNode: Tone.Gain;
	private _cutoff = 1000;
	private _q = 1.0;

	readonly input = undefined;
	readonly output: Tone.Gain;

	constructor(options?: Partial<FilteredNoiseNodeOptions>) {
		super(options);
		this._gainNode = new Tone.Gain({ context: this.context });
		this.output = this._gainNode;
	}

	async initialize(): Promise<void> {
		if (this._isInitialized) {
			return;
		}

		try {
			await audioContext.registerWorklet('/src/worklets/filtered-noise-worklet.ts', 'filtered-noise-worklet');
			this._worklet = await audioContext.createWorkletNode('filtered-noise-worklet');
			this._worklet.connect(this._gainNode.input);
			this._isInitialized = true;
		} catch (error) {
			console.error('Failed to initialize audio worklet:', error);
			throw error;
		}
	}

	start(): this {
		if (!this._isInitialized || !this._worklet) {
			throw new Error('FilteredNoiseNode must be initialized before starting');
		}
		this._worklet.port.postMessage({ type: 'toggle', active: true });
		return this;
	}

	stop(): this {
		if (this._worklet) {
			this._worklet.port.postMessage({ type: 'toggle', active: false });
		}
		return this;
	}

	setCutoff(freq: number): this {
		this._cutoff = Math.max(20, Math.min(20000, freq));
		if (this._worklet) {
			this._worklet.port.postMessage({
				type: 'filter',
				cutoff: this._cutoff,
				q: this._q,
			});
		}
		return this;
	}

	setQ(q: number): this {
		this._q = Math.max(0.1, Math.min(20, q));
		if (this._worklet) {
			this._worklet.port.postMessage({
				type: 'filter',
				cutoff: this._cutoff,
				q: this._q,
			});
		}
		return this;
	}

	dispose(): this {
		super.dispose();
		if (this._worklet) {
			this._worklet.disconnect();
			this._worklet = null;
		}
		this._gainNode.dispose();
		this._isInitialized = false;
		return this;
	}

	get initialized(): boolean {
		return this._isInitialized;
	}

	get cutoff(): number {
		return this._cutoff;
	}

	get q(): number {
		return this._q;
	}
}
