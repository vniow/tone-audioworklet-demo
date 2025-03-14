import { SliderControl } from './SliderControl'

/**
 * Props for the GainControl component
 */
interface GainControlProps {
	/**
	 * Current gain value (0-1)
	 */
	gain: number;

	/**
	 * Function to set gain value
	 */
	setGain: (value: number) => void;

	/**
	 * Optional label override
	 * @default "Volume"
	 */
	label?: string;
}

/**
 * A specialized control for managing audio gain (volume)
 *
 * This component provides a slider for controlling audio gain level
 * with percentage display formatting.
 */
export const GainControl = ({
	gain,
	setGain,
	label = 'Volume',
}: GainControlProps) => {
	return (
		<SliderControl
			label={label}
			value={gain}
			onChange={setGain}
			displayValue={`${Math.round(gain * 100)}%`}
			min={0}
			max={1}
			step={0.01}
		/>
	);
};
