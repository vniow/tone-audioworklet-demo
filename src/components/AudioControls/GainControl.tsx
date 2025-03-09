interface GainControlProps {
	gain: number;
	setGain: (value: number) => void;
}

export const GainControl = ({ gain, setGain }: GainControlProps) => {
	return (
		<div>
			<label className='block text-xs font-medium text-gray-700'>
				Volume: {Math.round(gain * 100)}%
			</label>
			<input
				type='range'
				min='0'
				max='1'
				step='0.01'
				value={gain}
				onChange={(e) => setGain(Number(e.target.value))}
				className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
			/>
		</div>
	);
};
