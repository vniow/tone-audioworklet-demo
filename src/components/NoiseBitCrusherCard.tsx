import { useCallback } from "react";
import * as Tone from "tone";

import { useGain } from "../hooks/useGain";
import { useNoiseWorklet } from "../hooks/useNoiseWorklet";
import { useBitCrusherWorklet } from "../hooks/useBitCrusherWorklet";
import { EffectCardLayout } from "./AudioControls/EffectCardLayout";
import { BitCrusherControls } from "./AudioControls/BitCrusherControls";
import { GainControl } from "./AudioControls/GainControl";

/**
 * wraps the white noise generator worklet with a bit crusher worklet and a volume control
 */
const NoiseBitCrusherCard = () => {
  // initialize the white noise generator worklet
  const {
    startNoise,
    stopNoise,
    noiseNode,
    isInitialized: isNoiseInitialized,
    isPlaying,
  } = useNoiseWorklet();

  // initialize the bitcrusher worklet
  const {
    bits,
    setBits,
    wet,
    setWet,
    bitCrusherNode,
    isInitialized: isBitCrusherInitialized,
  } = useBitCrusherWorklet({ bits: 4, wet: 0.75 });

  // initialize the gain node for volume control
  const {
    gain,
    setGain,
    gainNode,
    isInitialized: isGainInitialized,
  } = useGain({ gain: 0.25 });

  // overall initialization state
  const isInitialized =
    isNoiseInitialized && isBitCrusherInitialized && isGainInitialized;

  // connect noise to gain
  if (noiseNode && bitCrusherNode && gainNode) {
    noiseNode.connect(bitCrusherNode);
	bitCrusherNode.connect(gainNode);
    gainNode.toDestination();
  }
  // toggle noise playback
  const togglePlayback = useCallback(async () => {
    await Tone.start();
    if (isPlaying) {
      stopNoise();
    } else {
      startNoise();
    }
  }, [isPlaying, startNoise, stopNoise]);

  // debug state helper
  const debugState = () => {
    console.log("🔍 debug state:", {
      isPlaying,
      isInitialized,
      gain: `${gain} (linear)`,
      context: Tone.getContext().state,
      noiseNode,
      gainNode,
    });
  };

  return (
    <EffectCardLayout
      title="white noise + bit crusher"
      isInitialized={isInitialized}
      isPlaying={isPlaying}
      onPlay={togglePlayback}
      onDebug={debugState}
    >
      <BitCrusherControls
        bits={bits}
        setBits={setBits}
        wet={wet}
        setWet={setWet}
      />
      {/* volume control using gain */}
      <GainControl gain={gain} setGain={setGain} label="volume" />
    </EffectCardLayout>
  );
};

export default NoiseBitCrusherCard;
