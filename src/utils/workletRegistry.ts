import * as Tone from 'tone'

class WorkletRegistry {
	private static _instance: WorkletRegistry;
	private registeredWorklets = new Set<string>();
	private _toneContext: Tone.Context | null = null;

	private constructor() {}

	static getInstance(): WorkletRegistry {
		if (!WorkletRegistry._instance) {
			WorkletRegistry._instance = new WorkletRegistry();
		}
		return WorkletRegistry._instance;
	}

	async initialize(): Promise<void> {
		if (!this._toneContext) {
			await Tone.start();
			// this._toneContext = Tone.getContext();
			// await this._toneContext.resume();
		}
	}

	getToneContext(): Tone.Context {
		if (!this._toneContext) {
			throw new Error('WorkletRegistry not initialized. Call initialize() first.');
		}
		return this._toneContext;
	}

	async registerWorklet(url: string, name: string): Promise<void> {
		await this.initialize();

		if (this.registeredWorklets.has(name)) {
			console.log(`Worklet ${name} already registered`);
			return;
		}

		try {
			console.log(`Registering worklet: ${name}`);
			const workletUrl = new URL(url, window.location.href).href;
			await this._toneContext!.addAudioWorkletModule(workletUrl);
			this.registeredWorklets.add(name);
			console.log(`Successfully registered worklet: ${name}`);
		} catch (error) {
			console.error(`Failed to register worklet ${name}:`, error);
			throw error;
		}
	}

	isRegistered(name: string): boolean {
		return this.registeredWorklets.has(name);
	}
}

export const workletRegistry = WorkletRegistry.getInstance();
