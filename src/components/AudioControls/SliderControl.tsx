import { ChangeEvent } from 'react'

/**
 * props
 */
interface SliderControlProps {
	/**
	 * current value of the slider
	 */
	value: number;

	/**
	 * callback to handle slider changes
	 */
	onChange: (value: number) => void;

	/**
	 * label for the slider
	 */
	label: string;

	/**
	 * formatted display value
	 */
	displayValue?: string;

	/**
	 * minimum allowed value
	 * @default 0
	 */
	min?: number;

	/**
	 * maximum allowed value
	 * @default 1
	 */
	max?: number;

	/**
	 * step size for increments
	 * @default 0.01
	 */
	step?: number;

	/**
	 * additional CSS classes
	 */
	className?: string;
}

/**
 * component to render a slider control
 */
export const SliderControl = ({
	value,
	onChange,
	label,
	displayValue,
	min = 0,
	max = 1,
	step = 0.01,
	className = '',
}: SliderControlProps) => {
	// handle slider change
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		onChange(Number(e.target.value));
	};

	return (
		<div className={`mb-3.5 ${className}`}>
			<label className='block text-xs font-medium text-gray-700 dark:text-gray-300'>
				{label}: {displayValue ?? value}
			</label>

			{/* slider input with dark mode support */}
			<input
				type='range'
				value={value}
				min={min}
				max={max}
				step={step}
				onChange={handleChange}
				className='
					w-full
					h-4
					bg-gray-300
					dark:bg-gray-600
					rounded-lg
					appearance-none
					cursor-pointer
					outline-offset-1
					outline-pink-500
					dark:outline-pink-400
				'
			/>
		</div>
	);
};
