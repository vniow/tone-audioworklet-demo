/**
 * WorkletGlobalScope - refactored Tone.js utility for managing AudioWorklet shared code
 *
 * AudioWorklets must be written in JavaScript and be registered within the AudioWorkletNode global scope
 *
 */

/**
 * registry of worklet components by type
 */
interface WorkletRegistry {
	baseClasses: Set<string>;
	processors: Set<string>;
	utilities: Set<string>;
	registrations: Map<string, string>;
}

// registry to track different types of worklet code
const workletRegistry: WorkletRegistry = {
	baseClasses: new Set<string>(),
	processors: new Set<string>(),
	utilities: new Set<string>(),
	registrations: new Map<string, string>(),
};

/**
 * add base class code to the worklet global scope
 *
 * @param classCode - the class code to add (should be a class definition)
 * @returns void
 */
export function addBaseClass(classCode: string): void {
	workletRegistry.baseClasses.add(classCode);
}

/**
 * add utility code to the worklet global scope
 *
 * @param utilityCode - the utility code to add (functions, constants, etc.)
 * @returns void
 */
export function addUtility(utilityCode: string): void {
	workletRegistry.utilities.add(utilityCode);
}

/**
 * audio worklets need to be registered with the AudioWorkletNode global scope
 *
 * this creates the registerProcessor call to register the processor
 * with the AudioWorklet processing context
 *
 * @param name - the name to register the processor with
 * @param classDesc - JavaScript class as a string
 * @returns void
 * @throws error if a processor with the given name is already registered
 */
export function registerProcessor(name: string, classDesc: string): void {
	if (workletRegistry.registrations.has(name)) {
		throw new Error(`AudioWorklet processor "${name}" is already registered`);
	}

	const processor = /* javascript */ `registerProcessor("${name}", ${classDesc})`;
	workletRegistry.registrations.set(name, processor);
}

/**
 * get the complete JavaScript code for the worklet global scope in the correct load order
 *
 * @param debug - includes debug statements in the generated code
 * @returns the complete worklet code as a string
 */
export function getWorkletGlobalScope(debug: boolean = false): string {
	const parts: string[] = [];

	// add debug header if requested
	if (debug) {
		parts.push(
			`/* AudioWorklet Global Scope - Generated ${new Date().toISOString()} */`
		);
		parts.push(
			`console.log("🎛️ AudioWorklet global scope initializing with ${workletRegistry.registrations.size} processors");`
		);
	}

	// add base classes first
	workletRegistry.baseClasses.forEach((baseClass) => parts.push(baseClass));

	// add utility functions
	workletRegistry.utilities.forEach((utility) => parts.push(utility));

	// add processor implementations
	workletRegistry.processors.forEach((processor) => parts.push(processor));

	// ...and finally add processor registrations
	workletRegistry.registrations.forEach((registration) =>
		parts.push(registration)
	);

	return parts.join('\n\n');
}

/**
 * check if a processor is registered
 *
 * @param name - name of the processor to check
 * @returns true if the processor is registered
 */
export function isProcessorRegistered(name: string): boolean {
	return workletRegistry.registrations.has(name);
}

/**
 * get a list of all registered processor names
 *
 * @returns array of registered processor names
 */
export function getRegisteredProcessors(): string[] {
	return Array.from(workletRegistry.registrations.keys());
}

/**
 * reset the worklet registry - primarily for testing purposes
 */
export function resetWorkletRegistry(): void {
	workletRegistry.baseClasses.clear();
	workletRegistry.processors.clear();
	workletRegistry.utilities.clear();
	workletRegistry.registrations.clear();
}
