// minorly refactored wrapper around Tone's ToneAudioWorkletNode
import * as Tone from 'tone'

import { getWorkletGlobalScope } from './WorkletGlobalScope'

const noOp: (...args: unknown[]) => unknown = () => {
	// nada, nope, nuthin'
};

export type ToneWorkletBaseOptions = Tone.ToneAudioNodeOptions;

export abstract class ToneWorkletBase<
	Options extends ToneWorkletBaseOptions,
> extends Tone.ToneAudioNode<Options> {
	readonly name: string = 'ToneWorkletBase';
	protected _worklet!: AudioWorkletNode;
	private _dummyGain: GainNode;
	protected _dummyParam: AudioParam;
	protected workletOptions: Partial<AudioWorkletNodeOptions> = {};
	protected abstract _audioWorkletName(): string;
	protected abstract onReady(node: AudioWorkletNode): void;
	onprocessorerror: (e: ErrorEvent) => void = noOp;

	constructor(options: Options) {
		super(options);

		const blobUrl = URL.createObjectURL(
			new Blob([getWorkletGlobalScope()], { type: 'text/javascript' })
		);
		const name = this._audioWorkletName();

		this._dummyGain = this.context.createGain();
		this._dummyParam = this._dummyGain.gain;

		// Register the processor
		this.context.addAudioWorkletModule(blobUrl).then(() => {
			// create the worklet when it's read
			if (!this.disposed) {
				this._worklet = this.context.createAudioWorkletNode(
					name,
					this.workletOptions
				);
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
