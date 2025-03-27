# Audio Worklet Project Reference

## Core Concepts

- AudioWorklet: Web API for audio processing
- Tone.js: Framework for audio synthesis

## Component Relations

- ToneWorkletBase: Abstract base class for all audio nodes
- BitCrusherNode: Concrete implementation for bit crushing effects
- WorkletGlobalScope: Manages shared context between main thread and audio thread

## Common Patterns

- Audio initialization requires user gesture
- Node connection follows Tone.js chain pattern
- Parameters use Tone's unit conversion system
- Avoid using React.FC

## Type safety

- Avoid using 'any' whenever possible

## Common Prompts

- Debugging type errors: I'm getting a type error: [paste error] Here's my constructor code: [paste code].
  How can I fix this while maintaining TypeScript best practices?
- Implementation: I need to implement a new [function, component, property, method] similar to [existing implementation] but for [something similar] It should have parameters [some parameters]. Here's my [current implementation] for reference: [attach or paste in relevant parts]
- Refactoring: i'd like to refactor the [describe part of code that you want to refactor and how]. how would you recommend this?
- New Feature: I want to create a new audio processor called [name] that [describe what it does]. It should implement the [relevant interface] and have parameters for [list parameters]. Please help me implement both the worklet processor and the corresponding Tone.js node class.
- Documentation: I need to document the [class/component/file]. Please help me write comprehensive JSDoc comments following the project's documentation style. The documentation should include [specific details you want included].
- Error Correction: I'm getting the following error when [describe context/action]: [paste error]. Here's the relevant code: [paste code snippets]. Please help me identify and fix the issue while following the project's patterns.
- Debug Mode: I need to add debug capabilities to [component/class] to help troubleshoot [specific issue]. Please suggest how to implement debug logging that follows the existing debug pattern in ToneWorkletBase.
- Testing: I need to create tests for [component/feature]. Please help me write tests that verify [specific behaviors/edge cases]. The tests should follow audio processing best practices for testing.
