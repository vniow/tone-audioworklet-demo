import { EffectSection } from './EffectSection'
import { SliderControl } from './SliderControl'
import { WetDryControl } from './WetDryControl'

/**
 * props
 */
interface BitCrusherControlsProps {
	/**
	 * bit depth value
	 */
	bits: number;

	/**
	 * set the bit depth value
	 */
	setBits: (value: number) => void;

	/**
	 * wet/dry mix value
	 */
	wet: number;

	/**
	 * set the wet/dry mix value
	 */
	setWet: (value: number) => void;
}

/**
 * component to render the bitcrusher controls
 */
export const BitCrusherControls = ({
	bits,
	setBits,
	wet,
	setWet,
}: BitCrusherControlsProps) => {
	return (
		<EffectSection title='BitCrusher Effect'>
			{/* bit depth control */}
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
