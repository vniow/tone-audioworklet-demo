import { EffectSection } from './EffectSection'
import { SliderControl } from './SliderControl'
import { WetDryControl } from './WetDryControl'

/**
 * props for Delay effect controls
 */
interface DelayControlsProps {
	/**
	 * delay time in seconds
	 */
	delayTime: number;

	/**
	 * set the delay time in seconds
	 */
	setDelayTime: (value: number) => void;

	/**
	 * feedback amount (0-1)
	 */
	feedback: number;

	/**
	 * set the feedback amount (0-1)
	 */
	setFeedback: (value: number) => void;

	/**
	 * wet/dry mix value (0-1)
	 */
	wet: number;

	/**
	 * set the wet/dry mix value
	 */
	setWet: (value: number) => void;
}

/**
 * component to render the delay effect controls
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
		<EffectSection title='delay effect'>
			{/* delay time control */}
			<SliderControl
				label='delay time'
				value={delayTime}
				onChange={setDelayTime}
				displayValue={`${(delayTime * 1000).toFixed(0)}ms`}
				min={0}
				max={2}
				step={0.01}
			/>

			{/* feedback control */}
			<SliderControl
				label='feedback'
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
				label='delay mix'
			/>
		</EffectSection>
	);
};
