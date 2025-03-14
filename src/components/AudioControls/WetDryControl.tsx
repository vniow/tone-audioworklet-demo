import { SliderControl } from './SliderControl'

/**
 * Props for the WetDryControl component
 */
interface WetDryControlProps {
	/**
	 * Current wet/dry mix value (0-1)
	 * 0 = fully dry, 1 = fully wet
	 */
	wet: number;

	/**
	 * Function to set wet/dry mix value
	 */
	setWet: (value: number) => void;

	/**
	 * Optional label override
	 * @default "Effect Mix"
	 */
	label?: string;
}

/**
 * A specialized control for managing wet/dry mix of audio effects
 *
 * This component provides a slider for controlling the balance between
 * processed (wet) and unprocessed (dry) signals with appropriate labeling.
 */
export const WetDryControl = ({
	wet,
	setWet,
	label = 'Effect Mix',
}: WetDryControlProps) => {
	return (
		<div>
			<SliderControl
				label={label}
				value={wet}
				onChange={setWet}
				displayValue={`${Math.round(wet * 100)}%`}
				min={0}
				max={1}
				step={0.01}
			/>
			<div className='flex justify-between text-xs text-gray-500 -mt-2'>
				<span>Dry</span>
				<span>Wet</span>
			</div>
		</div>
	);
};
