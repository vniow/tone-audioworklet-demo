import * as Tone from 'tone'

import { getWorkletGlobalScope } from '../worklets/WorkletGlobalScope'

// Track which worklets have been registered
const registeredWorkletNames = new Set<string>();
let isInitializing = false;
let initPromise: Promise<string[]> | null = null;

// Define worklet configurations
export interface WorkletConfig {
	name: string;
	importFn: () => Promise<any>;
}

// Available worklets
export const WORKLETS = {
	BIT_CRUSHER: 'bit-crusher',
	DELAY: 'delay-processor',
};

const availableWorklets: Record<string, WorkletConfig> = {
	[WORKLETS.BIT_CRUSHER]: {
		name: WORKLETS.BIT_CRUSHER,
		importFn: async () => {
			await import('./BitCrusherNode');
			return import('../worklets/BitCrusher.worklet');
		},
	},
	[WORKLETS.DELAY]: {
		name: WORKLETS.DELAY,
		importFn: async () => {
			await import('./DelayNode');
			return import('../worklets/DelayProcessor.worklet');
		},
	},
};

/**
 * Initialize audio context and register specified worklets
 *
 * @param worklets Array of worklet names to initialize (default: all)
 * @returns Promise resolving to array of registered worklet names
 */
export async function initializeAudioWorklets(worklets: string[] = Object.values(WORKLETS)): Promise<string[]> {
	// If initialization is in progress, return the existing promise
	if (initPromise && isInitializing) {
		return initPromise;
	}

	// Filter out already registered worklets
	const workletConfigs = worklets
		.filter((name) => !registeredWorkletNames.has(name))
		.map((name) => availableWorklets[name])
		.filter(Boolean);

	// If all requested worklets are already registered, return early
	if (workletConfigs.length === 0) {
		console.log('All requested worklets already registered');
		return Promise.resolve(Array.from(registeredWorkletNames));
	}

	isInitializing = true;
	initPromise = registerWorklets(workletConfigs);

	try {
		return await initPromise;
	} finally {
		isInitializing = false;
		initPromise = null;
	}
}

// Private implementation details
async function registerWorklets(worklets: WorkletConfig[]): Promise<string[]> {
	// Load all worklet modules (triggering their registration with WorkletGlobalScope)
	await Promise.all(worklets.map((config) => config.importFn()));

	// Start Tone.js
	await Tone.start();

	// Create a blob with all worklet code
	const audioWorkletBlob = new Blob([getWorkletGlobalScope()], {
		type: 'text/javascript',
	});
	const workletUrl = URL.createObjectURL(audioWorkletBlob);

	try {
		// Register all worklets
		await Tone.getContext().addAudioWorkletModule(workletUrl);

		// Record successful registrations
		worklets.forEach((worklet) => {
			registeredWorkletNames.add(worklet.name);
		});

		console.log(`Successfully registered audio worklets: ${worklets.map((w) => w.name).join(', ')}`);

		return Array.from(registeredWorkletNames);
	} catch (error) {
		console.error('Failed to register audio worklets:', error);
		throw error;
	} finally {
		URL.revokeObjectURL(workletUrl);
	}
}

// Convenience functions
export async function initializeBitCrusher(): Promise<string[]> {
	return initializeAudioWorklets([WORKLETS.BIT_CRUSHER]);
}

export async function initializeDelay(): Promise<string[]> {
	return initializeAudioWorklets([WORKLETS.DELAY]);
}

export async function initializeAllAudio(): Promise<string[]> {
	return initializeAudioWorklets();
}
