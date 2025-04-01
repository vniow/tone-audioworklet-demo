# Tone.js AudioWorklet Demo

## what is it

Tone.js, while a wonderful audio library for web audio, does not by default offer a way to create a node using a custom AudioWorklet and keep it within the Tone.js ecosystem. 

Because Tone.js is built on top of the Web Audio API, it has full access to the AudioContext, in which you can use to create a worklet. There has been some discussion about it in [this thread] on how to plug into that in a React context, but I wanted something a bit more robust, and type safe. 

## how does it work

Tone.js has existing nodes that are built with custom AudioWorklets that live under a ToneAudioWorkletClass. Unfortunately, this class is not exposed via the API, so I receated it.

ToneWorkletBase is a class which extends Tone.ToneAudioNode and enables an AudioWorklet object to exist within the Tone.js ecosystem. This means it has access to any other method or parameter that any other [ToneAudioNode] object has access to. 

To demonstrate, I created a few different types of audio nodes, a [NoiseProcessor], a [BitCrusher], and a [DelayProcessor]. Each one is powered by their own AudioWorklet, and I created a custom hook to manage the worklet's lifecycle within a React context. 
