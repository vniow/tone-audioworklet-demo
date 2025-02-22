import * as Tone from 'tone'

class AudioContextManager {
	private static instance: AudioContextManager;
	private context: Tone.Context | null = null;
	private worklets = new Set<string>();

	private constructor() {}

	static getInstance(): AudioContextManager {
		if (!AudioContextManager.instance) {
			AudioContextManager.instance = new AudioContextManager();
		}
		return AudioContextManager.instance;
	}

	async ensureContext(): Promise<Tone.Context> {
		if (!this.context) {
			await Tone.start();
			this.context = new Tone.Context();
			await this.context.resume();
		}
		return this.context;
	}

	async registerWorklet(url: string, processorName: string): Promise<void> {
		if (this.worklets.has(processorName)) {
			return; // Already registered
		}

		const ctx = await this.ensureContext();
		const workletUrl = new URL(url, window.location.href).href;
		await ctx.addAudioWorkletModule(workletUrl);
		this.worklets.add(processorName);
		console.log(`Successfully registered worklet: ${processorName}`);
	}

	async createWorkletNode(processorName: string): Promise<AudioWorkletNode> {
		const ctx = await this.ensureContext();
		if (!this.worklets.has(processorName)) {
			throw new Error(`Worklet ${processorName} not registered. Call registerWorklet first.`);
		}
		return new AudioWorkletNode(ctx.rawContext, processorName);
	}
}

export const audioContext = AudioContextManager.getInstance();
