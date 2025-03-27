import { SliderControl } from './SliderControl'

/**
 * props
 */
interface WetDryControlProps {
	/**
	 * current wet/dry mix value (0-1)
	 * 0 = fully dry, 1 = fully wet
	 */
	wet: number;

	/**
	 * set wet/dry mix value
	 */
	setWet: (value: number) => void;

	/**
	 * optional label override
	 * @default "Effect Mix"
	 */
	label?: string;
}

/**
 * component to render a wet/dry mix control slider
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
			<div className='flex justify-between text-xs text-gray-700 dark:text-gray-300 -mt-2'>
				<span>Dry</span>
				<span>Wet</span>
			</div>
		</div>
	);
};
