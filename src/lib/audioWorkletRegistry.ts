import * as Tone from 'tone'

import { getWorkletGlobalScope } from '../worklets/WorkletGlobalScope'

// Track registered worklets and in-progress registrations
const registeredWorklets = new Set<string>();
const pendingRegistrations = new Map<string, Promise<void>>();

/**
 * Ensures that a worklet is registered with the audio context.
 * If the worklet is already registered, it returns immediately.
 * If registration is in progress, it returns the existing promise.
 * If not registered, it initiates registration.
 *
 * @param workletName The name of the worklet to register
 * @returns Promise that resolves when registration is complete
 */
export async function ensureWorkletRegistered(workletName: string): Promise<void> {
	// If already registered, return immediately
	if (registeredWorklets.has(workletName)) {
		return Promise.resolve();
	}

	// If registration is already in progress, return existing promise
	if (pendingRegistrations.has(workletName)) {
		return pendingRegistrations.get(workletName) as Promise<void>;
	}

	// Start a new registration
	const registrationPromise = registerWorklet(workletName);
	pendingRegistrations.set(workletName, registrationPromise);

	try {
		await registrationPromise;
		// Once registered, add to the set and remove from pending
		registeredWorklets.add(workletName);
		pendingRegistrations.delete(workletName);
		console.log(`Successfully registered audio worklet: ${workletName}`);
	} catch (error) {
		// If registration fails, remove from pending so it can be tried again
		pendingRegistrations.delete(workletName);
		console.error(`Failed to register audio worklet ${workletName}:`, error);
		throw error;
	}

	return;
}

/**
 * Internal function to handle the actual worklet registration
 *
 * @param workletName The name of the worklet to register
 * @returns Promise that resolves when registration is complete
 */
async function registerWorklet(workletName: string): Promise<void> {
	// Ensure Tone.js is started
	await Tone.start();

	// Create a blob URL with all worklet code
	const audioWorkletBlob = new Blob([getWorkletGlobalScope()], {
		type: 'text/javascript',
	});
	const workletUrl = URL.createObjectURL(audioWorkletBlob);

	try {
		// Register the worklet
		await Tone.getContext().addAudioWorkletModule(workletUrl);
	} finally {
		// Always clean up the URL
		URL.revokeObjectURL(workletUrl);
	}
}

/**
 * Check if a worklet is already registered
 *
 * @param workletName The name of the worklet to check
 * @returns Boolean indicating if the worklet is registered
 */
export function isWorkletRegistered(workletName: string): boolean {
	return registeredWorklets.has(workletName);
}

/**
 * Clear all registered worklets (useful for testing or context changes)
 */
export function clearRegisteredWorklets(): void {
	registeredWorklets.clear();
}
