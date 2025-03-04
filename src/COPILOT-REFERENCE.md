# Audio Worklet Project Reference

## Core Concepts

- AudioWorklet: Web API for audio processing
- Tone.js: Framework for audio synthesis

## Component Relations

- ToneWorkletBase: Abstract base class for all audio nodes
- WorkletGlobalScope: Manages shared context between main thread and audio thread

## Common Patterns

- Audio initialization requires user gesture
- Node connection follows Tone.js chain pattern
- Parameters use Tone's unit conversion system

## Type safety

- Avoid using 'any' whenever possible
