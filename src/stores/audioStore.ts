import * as Tone from 'tone';
import { create } from 'zustand';

interface AudioStore {
	context: Tone.BaseContext | null;
	isContextStarted: boolean;
	initializeContext: () => Promise<void>;
	disposeContext: () => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
	context: null,
	isContextStarted: false,
	initializeContext: async () => {
		if (!get().context) {
			await Tone.start();
			set({ context: Tone.getContext(), isContextStarted: true });
		}
	},
	disposeContext: () => {
		const { context } = get();
		if (context) {
			context.dispose();
			set({ context: null, isContextStarted: false });
		}
	},
}));
