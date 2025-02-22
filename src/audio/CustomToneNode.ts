import * as Tone from 'tone'

import { audioContext } from '../utils/audioContext'

interface CustomToneNodeOptions {
    context: Tone.Context;
}

export class CustomToneNode extends Tone.ToneAudioNode<CustomToneNodeOptions> {
    readonly name = 'CustomToneNode';

    private _worklet: AudioWorkletNode | null = null;
    private _isInitialized = false;
    private _gainNode: Tone.Gain;

    readonly input = undefined;
    readonly output: Tone.Gain;

    constructor(options?: Partial<CustomToneNodeOptions>) {
        super(options);
        this._gainNode = new Tone.Gain({ context: this.context });
        this.output = this._gainNode;
    }

    async initialize(): Promise<void> {
        if (this._isInitialized) {
            return;
        }

        try {
            await audioContext.registerWorklet('/src/worklets/noise-worklet.ts', 'noise-worklet');
            this._worklet = await audioContext.createWorkletNode('noise-worklet');
            this._worklet.connect(this._gainNode.input);
            this._isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize audio worklet:', error);
            throw error;
        }
    }

    start(): this {
        if (!this._isInitialized || !this._worklet) {
            throw new Error('CustomToneNode must be initialized before starting');
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
}
