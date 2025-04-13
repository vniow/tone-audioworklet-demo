# Tone.js AudioWorklet Demo

## what is it

Tone.js, while a wonderful audio library for web audio, does not by default offer a way to create a node using a custom AudioWorklet and keep it within the Tone.js ecosystem.

Because Tone.js is built on top of the Web Audio API, it has full access to the AudioContext in which you can use to create a worklet. There has been some discussion about this in [this issue on Tone.js](https://github.com/Tonejs/Tone.js/issues/1138) on how to create the scaffolding for a custom worklet, my goal was to create a more robust and type safe implementation.

## how does it work

Tone.js has existing nodes that are built with custom AudioWorklets that live under a `ToneAudioWorkletClass`. Unfortunately this class is not exposed via the API, so I receated it.

The base worklet

[ToneWorkletBase](/src/lib/ToneWorkletBase.ts) is a class which extends `Tone.ToneAudioNode` and enables an AudioWorklet object to exist within the Tone.js ecosystem. This means it has access to any other method or parameter that any other [ToneAudioNode] object has access to.

To demonstrate, I created a few different types of audio nodes, a [Noise Generator](src/lib/NoiseNode.ts), a [BitCrusher](/src/lib/BitCrusherNode.ts), and a [DelayProcessor](src/lib/DelayNode.ts). Each one is powered by their own AudioWorklet coupled with a custom hook to manage the worklet's lifecycle within a React context.
