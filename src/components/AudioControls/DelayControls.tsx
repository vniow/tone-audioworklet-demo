import { EffectSection } from './EffectSection'
import { SliderControl } from './SliderControl'
import { WetDryControl } from './WetDryControl'

/**
 * Props for Delay effect controls
 */
interface DelayControlsProps {
	/**
	 * Current delay time in seconds
	 */
	delayTime: number;

	/**
	 * Function to set delay time
	 */
	setDelayTime: (value: number) => void;

	/**
	 * Current feedback amount (0-1)
	 */
	feedback: number;

	/**
	 * Function to set feedback amount
	 */
	setFeedback: (value: number) => void;

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
 * A component for controlling Delay effect parameters
 *
 * Provides controls for delay time, feedback and wet/dry mix in a standardized layout.
 */
export const DelayControls = ({
	delayTime,
	setDelayTime,
	feedback,
	setFeedback,
	wet,
	setWet,
}: DelayControlsProps) => {
	return (
		<EffectSection title='Delay Effect'>
			{/* Delay Time control */}
			<SliderControl
				label='Delay Time'
				value={delayTime}
				onChange={setDelayTime}
				displayValue={`${(delayTime * 1000).toFixed(0)}ms`}
				min={0}
				max={2}
				step={0.01}
			/>

			{/* Feedback control */}
			<SliderControl
				label='Feedback'
				value={feedback}
				onChange={setFeedback}
				displayValue={`${Math.round(feedback * 100)}%`}
				min={0}
				max={0.99}
				step={0.01}
			/>

			<WetDryControl
				wet={wet}
				setWet={setWet}
				label='Delay Mix'
			/>
		</EffectSection>
	);
};
