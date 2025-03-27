import { useCallback } from "react";
import * as Tone from "tone";

import { useOscillator } from "../hooks/useOscillator";
import { useGain } from "../hooks/useGain";
import { EffectCardLayout } from "./AudioControls/EffectCardLayout";
import { GainControl } from "./AudioControls/GainControl";
import { OscillatorControls } from "./AudioControls/OscillatorControls";
import { useBitCrusherWorklet } from "../hooks/useBitCrusherWorklet";
import { BitCrusherControls } from "./AudioControls/BitCrusherControls";

/**
 * component combines oscillator with bitcrusher effect and volume control
 */
const OscBitCrusherCard = () => {
  // initialise the oscillator
  const {
    oscillator,
    isInitialized: isOscillatorInitialized,
    isPlaying,
    startOscillator,
    stopOscillator,
    setFrequency,
    setType,
    frequency,
    type,
  } = useOscillator({ frequency: 440, type: "square" });

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
  const isInitialized = isOscillatorInitialized && isBitCrusherInitialized && isGainInitialized;

  // connect oscillator to bitcrusher to gain to output
  if (oscillator && bitCrusherNode && gainNode) {
    oscillator.connect(bitCrusherNode);
    bitCrusherNode.connect(gainNode);
    gainNode.toDestination();
  }
  
  // toggle oscillator playback
  const togglePlayback = useCallback(async () => {
    await Tone.start();
    if (isPlaying) {
      stopOscillator();
    } else {
      startOscillator();
    }
  }, [isPlaying, startOscillator, stopOscillator]);

  // debug state helper
  const debugState = () => {
    console.log("🔍 debug state:", {
      isPlaying,
      isInitialized,
      frequency,
      type,
      bits,
      wet,
      gain: `${gain} (linear)`,
      context: Tone.getContext().state,
    });
  };

  return (
    <EffectCardLayout
      title="oscillator + bit crusher"
      isInitialized={isInitialized}
      isPlaying={isPlaying}
      onPlay={togglePlayback}
      onDebug={debugState}
    >
      <OscillatorControls
        frequency={frequency}
        type={type}
        setFrequency={setFrequency}
        setType={setType}

      />
      
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

export default OscBitCrusherCard;
