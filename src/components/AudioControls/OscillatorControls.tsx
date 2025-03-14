import * as Tone from 'tone'

import { SliderControl } from './SliderControl'

interface OscillatorControlsProps {
	frequency: number;
	type: Tone.ToneOscillatorType;
	setFrequency: (value: number) => void;
	setType: (type: Tone.ToneOscillatorType) => void;
}

export const OscillatorControls = ({
	frequency,
	type,
	setFrequency,
	setType,
}: OscillatorControlsProps) => {
	return (
		<>
			{/* Frequency control */}
			<SliderControl
				label='Oscillator frequency'
				value={frequency}
				onChange={setFrequency}
				displayValue={`${frequency} Hz`}
				min={1}
				max={2000}
				step={1}
			/>

			{/* Waveform type selector with icons */}
			<div>
				<label className='block text-xs font-medium text-gray-700 mb-1'>
					Oscillator Type
				</label>
				<div className='flex space-x-2'>
					{/* Sine wave */}
					<button
						onClick={() => setType('sine')}
						className={`p-2 border rounded-md w-16 h-16 flex items-center justify-center ${
							type === 'sine'
								? 'bg-indigo-100 border-indigo-500'
								: 'border-gray-300'
						}`}
						title='Sine wave'
					>
						<svg
							viewBox='0 0 60 30'
							className='w-full h-full'
						>
							<path
								d='M 0,15 C 10,5 20,25 30,15 C 40,5 50,25 60,15'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
							/>
						</svg>
					</button>

					{/* Square wave */}
					<button
						onClick={() => setType('square')}
						className={`p-2 border rounded-md w-16 h-16 flex items-center justify-center ${
							type === 'square'
								? 'bg-indigo-100 border-indigo-500'
								: 'border-gray-300'
						}`}
						title='Square wave'
					>
						<svg
							viewBox='0 0 60 30'
							className='w-full h-full'
						>
							<path
								d='M 0,25 L 0,5 L 30,5 L 30,25 L 60,25 L 60,5'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
							/>
						</svg>
					</button>

					{/* Sawtooth wave */}
					<button
						onClick={() => setType('sawtooth')}
						className={`p-2 border rounded-md w-16 h-16 flex items-center justify-center ${
							type === 'sawtooth'
								? 'bg-indigo-100 border-indigo-500'
								: 'border-gray-300'
						}`}
						title='Sawtooth wave'
					>
						<svg
							viewBox='0 0 60 30'
							className='w-full h-full'
						>
							<path
								d='M 0,25 L 20,5 L 20,25 L 40,5 L 40,25 L 60,5'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
							/>
						</svg>
					</button>

					{/* Triangle wave */}
					<button
						onClick={() => setType('triangle')}
						className={`p-2 border rounded-md w-16 h-16 flex items-center justify-center ${
							type === 'triangle'
								? 'bg-indigo-100 border-indigo-500'
								: 'border-gray-300'
						}`}
						title='Triangle wave'
					>
						<svg
							viewBox='0 0 60 30'
							className='w-full h-full'
						>
							<path
								d='M 0,15 L 15,5 L 30,25 L 45,5 L 60,15'
								fill='none'
								stroke='currentColor'
								strokeWidth='2'
							/>
						</svg>
					</button>
				</div>
			</div>
		</>
	);
};
