/**
 * WorkletGlobalScope - Utility for managing AudioWorklet shared code
 *
 * This module provides utilities for aggregating JavaScript code that will run
 * in the AudioWorklet global scope. It handles registration of processors and
 * their dependencies.
 */

/**
 * Registry of worklet components by type
 */
interface WorkletRegistry {
	baseClasses: Set<string>;
	processors: Set<string>;
	utilities: Set<string>;
	registrations: Map<string, string>;
}

// Registry to track different types of worklet code
const workletRegistry: WorkletRegistry = {
	baseClasses: new Set<string>(),
	processors: new Set<string>(),
	utilities: new Set<string>(),
	registrations: new Map<string, string>(),
};

/**
 * Add base class code to the worklet global scope
 *
 * @param classCode - The class code to add (should be a class definition)
 * @returns void
 */
export function addBaseClass(classCode: string): void {
	workletRegistry.baseClasses.add(classCode);
}

/**
 * Add utility code to the worklet global scope
 *
 * @param utilityCode - The utility code to add (functions, constants, etc.)
 * @returns void
 */
export function addUtility(utilityCode: string): void {
	workletRegistry.utilities.add(utilityCode);
}

/**
 * Add worklet processor code to the global scope
 *
 * This is kept for backward compatibility with existing code.
 * For new code, prefer using more specific functions like addBaseClass.
 *
 * @param classOrFunction - The code to add to the worklet
 * @returns void
 */
export function addToWorklet(classOrFunction: string): void {
	workletRegistry.processors.add(classOrFunction);
}

/**
 * Register a processor with the AudioWorklet
 *
 * This creates the registerProcessor call to register the processor
 * with the AudioWorklet processing context.
 *
 * @param name - Name to register the processor with
 * @param classDesc - JavaScript class as a string
 * @returns void
 * @throws Error if a processor with the given name is already registered
 */
export function registerProcessor(name: string, classDesc: string): void {
	if (workletRegistry.registrations.has(name)) {
		throw new Error(`AudioWorklet processor "${name}" is already registered`);
	}

	const processor = /* javascript */ `registerProcessor("${name}", ${classDesc})`;
	workletRegistry.registrations.set(name, processor);
}

/**
 * Get the complete code for the worklet global scope in the correct load order
 *
 * @param debug - If true, includes debug statements in the generated code
 * @returns The complete worklet code as a string
 */
export function getWorkletGlobalScope(debug: boolean = false): string {
	const parts: string[] = [];

	// Add debug header if requested
	if (debug) {
		parts.push(
			`/* AudioWorklet Global Scope - Generated ${new Date().toISOString()} */`
		);
		parts.push(
			`console.log("🎛️ AudioWorklet global scope initializing with ${workletRegistry.registrations.size} processors");`
		);
	}

	// Add base classes first
	workletRegistry.baseClasses.forEach((baseClass) => parts.push(baseClass));

	// Add utility functions
	workletRegistry.utilities.forEach((utility) => parts.push(utility));

	// Add processor implementations
	workletRegistry.processors.forEach((processor) => parts.push(processor));

	// Add processor registrations last
	workletRegistry.registrations.forEach((registration) =>
		parts.push(registration)
	);

	return parts.join('\n\n');
}

/**
 * Check if a processor is registered
 *
 * @param name - Name of the processor to check
 * @returns True if the processor is registered
 */
export function isProcessorRegistered(name: string): boolean {
	return workletRegistry.registrations.has(name);
}

/**
 * Get a list of all registered processor names
 *
 * @returns Array of registered processor names
 */
export function getRegisteredProcessors(): string[] {
	return Array.from(workletRegistry.registrations.keys());
}

/**
 * Reset the worklet registry - primarily for testing purposes
 */
export function resetWorkletRegistry(): void {
	workletRegistry.baseClasses.clear();
	workletRegistry.processors.clear();
	workletRegistry.utilities.clear();
	workletRegistry.registrations.clear();
}
