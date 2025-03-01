# Audio Worklet Project Reference

## Core Concepts

- AudioWorklet: Web API for audio processing
- Tone.js: Framework for audio synthesis
- BitCrusher: Effect that reduces bit depth of audio

## Component Relations

- ToneWorkletBase: Abstract base class for all audio nodes
- BitCrusherNode: Concrete implementation for bit crushing effects
- WorkletGlobalScope: Manages shared context between main thread and audio thread

## Common Patterns

- Audio initialization requires user gesture
- Node connection follows Tone.js chain pattern
- Parameters use Tone's unit conversion system

## Common Prompts

- Debugging type errors: I'm getting a type error: [paste error] Here's my constructor code: [paste code].
  How can I fix this while maintaining TypeScript best practices?
- Implementation: I need to implement a new [function, component, property, method] similar to [existing implementation] but for [something similar] It should have parameters [some parameters]. Here's my [current implementation] for reference: [attach or paste in relevant parts]
- Refactoring: i'd like to refactor the [describe part of code that you want to refactor and how]. how would you recommend this?
