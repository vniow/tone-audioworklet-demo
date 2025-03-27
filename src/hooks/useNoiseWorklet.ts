import { useEffect, useRef, useState } from "react";
import * as Tone from "tone";

import { NoiseNode } from "../lib/NoiseNode";
import { getWorkletGlobalScope } from "../lib/WorkletGlobalScope";
import { workletName } from "../worklets/NoiseProcessor.worklet";

// options interface for the noise generator hook
export interface NoiseOptions {
  /**
   * should the noise generator start automatically
   * @default false
   */
  autostart?: boolean;
}

export interface NoiseHookResult {
  /**
   * noise node reference
   */
  noiseNode: NoiseNode | null;
  isInitialized: boolean;
  isPlaying: boolean;

  /**
   * start the noise generator
   */
  startNoise: () => void;

  /**
   * stop the noise generator
   */
  stopNoise: () => void;
}

/**
 * hook to create and manage a white noise generator worklet
 *
 * @param options - config options for the noise generator
 * @returns noise generator control interface
 */
export const useNoiseWorklet = (
  options: NoiseOptions = {}
): NoiseHookResult => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // refs to prevent recreation of nodes
  const noiseNodeRef = useRef<NoiseNode | null>(null);
  const mountedRef = useRef(true); // Track if component is mounted

  // create noise node ONCE on mount
  useEffect(() => {
    mountedRef.current = true;
    console.log("🎛️ initializing white noise worklet...");

    const setupNoiseWorklet = async () => {
      try {
        // initialize audio worklets
        await Tone.start();

        // Register worklets
        const audioWorkletBlob = new Blob([getWorkletGlobalScope()], {
          type: "text/javascript",
        });
        const workletUrl = URL.createObjectURL(audioWorkletBlob);

        try {
          await Tone.getContext().addAudioWorkletModule(workletUrl);
          console.log(`successfully registered audio worklets: ${workletName}`);
        } catch (error) {
          console.error("failed to register audio worklets:", error);
          throw error;
        } finally {
          URL.revokeObjectURL(workletUrl);
        }

        // only continue if component is still mounted
        if (!mountedRef.current) return;

        // Create a noise node
        const newNoiseNode = new NoiseNode({
          autostart: options.autostart,
        });

        // update playing state if autostart is enabled
        if (options.autostart) {
          setIsPlaying(true);
        }

        // store that reference
        noiseNodeRef.current = newNoiseNode;
        setIsInitialized(true);

        console.log("✅ white noise node initialized");
      } catch (error) {
        console.error("❌ error initializing White Noise node:", error);
      }
    };

    setupNoiseWorklet();

    // cleanup on unmount
    return () => {
      mountedRef.current = false;
      console.log("🧹 Cleaning up White Noise node");
      if (noiseNodeRef.current) {
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current.dispose();
        noiseNodeRef.current = null;
      }
    };
  }, []);

  // start the noise generator
  const startNoise = async () => {
    if (noiseNodeRef.current && !isPlaying) {
      await Tone.start();
	  noiseNodeRef.current.start();
      setIsPlaying(true);
      console.log("▶️ white noise generation started");
    }
  };

  // stop the noise generator
  const stopNoise = () => {
    if (noiseNodeRef.current && isPlaying) {
      noiseNodeRef.current.stop();
      setIsPlaying(false);
      console.log("⏹️ white noise generation stopped");
    }
  };

  return {
    noiseNode: noiseNodeRef.current,
    isInitialized,
    isPlaying,
    startNoise,
    stopNoise,
  };
};
