import * as Tone from 'tone'

class AudioContextManager {
	private static _instance: AudioContextManager;
	private _initialized = false;

	private constructor() {}

	static getInstance(): AudioContextManager {
		if (!AudioContextManager._instance) {
			AudioContextManager._instance = new AudioContextManager();
		}
		return AudioContextManager._instance;
	}

	async initialize(): Promise<void> {
		if (this._initialized) return;

		try {
			await Tone.start();
			const context = Tone.getContext();
			await context.resume();
			this._initialized = true;
			console.log('Audio context initialized successfully');
		} catch (error) {
			console.error('Failed to initialize audio context:', error);
			throw error;
		}
	}

	isInitialized(): boolean {
		return this._initialized;
	}
}

export const audioContextManager = AudioContextManager.getInstance();
