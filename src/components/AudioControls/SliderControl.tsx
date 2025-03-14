import { ChangeEvent } from 'react'

/**
 * Props for the SliderControl component
 */
interface SliderControlProps {
	/**
	 * Current value of the slider
	 */
	value: number;

	/**
	 * Function called when slider value changes
	 */
	onChange: (value: number) => void;

	/**
	 * Label text displayed above the slider
	 */
	label: string;

	/**
	 * Formatted value to display (will use raw value if not provided)
	 */
	displayValue?: string;

	/**
	 * Minimum allowed value
	 * @default 0
	 */
	min?: number;

	/**
	 * Maximum allowed value
	 * @default 1
	 */
	max?: number;

	/**
	 * Step size for increments
	 * @default 0.01
	 */
	step?: number;

	/**
	 * Additional CSS classes
	 */
	className?: string;
}

/**
 * A reusable slider control component with standardized styling
 *
 * This component provides a consistent slider UI across the application
 * with configurable ranges and formatting.
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
	// Handle slider change
	const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
		onChange(Number(e.target.value));
	};

	return (
		<div className={`mb-3.5 ${className}`}>
			<label className='block text-xs font-medium text-gray-700'>
				{label}: {displayValue ?? value}
			</label>

			{/* The slider input */}
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
					rounded-sm
					appearance-none
					cursor-pointer
					outline-offset-1
					outline-pink-500
					
					'
			/>
		</div>
	);
};
