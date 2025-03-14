import { EffectSection } from './EffectSection'
import { SliderControl } from './SliderControl'
import { WetDryControl } from './WetDryControl'

/**
 * Props for BitCrusher effect controls
 */
interface BitCrusherControlsProps {
	/**
	 * Current bit depth value
	 */
	bits: number;

	/**
	 * Function to set bit depth
	 */
	setBits: (value: number) => void;

	/**
	 * Current wet/dry mix value
	 */
	wet: number;

	/**
	 * Function to set wet/dry mix
	 */
	setWet: (value: number) => void;
}

/**
 * A component for controlling BitCrusher effect parameters
 *
 * Provides controls for bit depth and wet/dry mix in a standardized layout.
 */
export const BitCrusherControls = ({
	bits,
	setBits,
	wet,
	setWet,
}: BitCrusherControlsProps) => {
	return (
		<EffectSection title='BitCrusher Effect'>
			{/* Bit depth control */}
			<SliderControl
				label='Bit Depth'
				value={bits}
				onChange={setBits}
				displayValue={`${bits} bits`}
				min={1}
				max={16}
				step={1}
			/>

			<WetDryControl
				wet={wet}
				setWet={setWet}
				label='BitCrusher Mix'
			/>
		</EffectSection>
	);
};
