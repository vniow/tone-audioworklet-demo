import * as Tone from 'tone'

import { getWorkletGlobalScope } from '../worklets/WorkletGlobalScope.js'

const noOp: (...args: unknown[]) => unknown = () => {
	// no operation here!
};

export type ToneWorkletBaseOptions = Tone.ToneAudioNodeOptions;

export abstract class ToneWorkletBase<Options extends ToneWorkletBaseOptions> extends Tone.ToneAudioNode<Options> {
	readonly name: string = 'ToneWorkletBase';

	/**
	 * The processing node
	 */
	protected _worklet!: AudioWorkletNode;

	/**
	 * A dummy gain node to create a dummy audio param from
	 */
	private _dummyGain: GainNode;

	/**
	 * A dummy audio param to use when creating Params
	 */
	protected _dummyParam: AudioParam;

	/**
	 * The constructor options for the node
	 */
	protected workletOptions: Partial<AudioWorkletNodeOptions> = {};

	/**
	 * Get the name of the audio worklet
	 */
	protected abstract _audioWorkletName(): string;

	/**
	 * Invoked when the module is loaded and the node is created
	 */
	protected abstract onReady(node: AudioWorkletNode): void;

	/**
	 * Callback which is invoked when there is an error in the processing
	 */
	onprocessorerror: (e: ErrorEvent) => void = noOp;

	constructor(options: Options) {
		super(options);

		const blobUrl = URL.createObjectURL(new Blob([getWorkletGlobalScope()], { type: 'text/javascript' }));
		const name = this._audioWorkletName();

		this._dummyGain = this.context.createGain();
		this._dummyParam = this._dummyGain.gain;

		// Register the processor
		this.context.addAudioWorkletModule(blobUrl).then(() => {
			// create the worklet when it's read
			if (!this.disposed) {
				this._worklet = this.context.createAudioWorkletNode(name, this.workletOptions);
				this._worklet.onprocessorerror = this.onprocessorerror.bind(this);
				this.onReady(this._worklet);
			}
		});
	}

	dispose(): this {
		super.dispose();
		this._dummyGain.disconnect();
		if (this._worklet) {
			this._worklet.port.postMessage('dispose');
			this._worklet.disconnect();
		}
		return this;
	}
}
