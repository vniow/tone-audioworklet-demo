import { SliderControl } from './SliderControl'

/**
 * props
 */
interface GainControlProps {
	/**
	 * current gain value (0-1)
	 */
	gain: number;

	/**
	 * set the gain value (0-1)
	 */
	setGain: (value: number) => void;

	/**
	 * optional label override
	 * @default "volume"
	 */
	label?: string;
}

/**
 * component to render a gain control slider
 */
export const GainControl = ({
	gain,
	setGain,
	label = 'volume',
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
