const workletContext: Set<string> = new Set();

export function addToWorklet(classOrFunction: string) {
	workletContext.add(classOrFunction);
}
// it is necessary to register the audio worklet processor as a javascript file due to some technical limitations
// the Tone.js library puts javascript code in a string within a TypeScript file.
// because I'm shamelessly using code from the original Tone.js library, why reinvent the wheel
export function registerProcessor(name: string, classDesc: string) {
	// protip: find an IDE extension that will format the code in a string, it'll make your life easier
	const processor = /* javascript */ `registerProcessor("${name}", ${classDesc})`;
	workletContext.add(processor);
}

export function getWorkletGlobalScope(): string {
	return Array.from(workletContext).join('\n');
}
