import * as Tone from 'tone'

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
			<div>
				<label className='block text-xs font-medium text-gray-700'>
					Oscillator frequency: {frequency} Hz
				</label>
				<input
					type='range'
					min='20'
					max='2000'
					step='1'
					value={frequency}
					onChange={(e) => setFrequency(Number(e.target.value))}
					className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
				/>
			</div>

			{/* Oscillator type selector */}
			<div>
				<label className='block text-xs font-medium text-gray-700 mb-1'>
					Oscillator Type
				</label>
				<select
					value={type}
					onChange={(e) => setType(e.target.value as Tone.ToneOscillatorType)}
					className='text-xs block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
				>
					<option value='sine'>Sine</option>
					<option value='square'>Square</option>
					<option value='sawtooth'>Sawtooth</option>
					<option value='triangle'>Triangle</option>
				</select>
			</div>
		</>
	);
};
