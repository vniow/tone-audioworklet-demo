interface WetDryControlProps {
	wet: number;
	setWet: (value: number) => void;
	label?: string;
}

export const WetDryControl = ({
	wet,
	setWet,
	label = 'Effect Mix',
}: WetDryControlProps) => {
	return (
		<div>
			<label className='block text-xs font-medium text-gray-700'>
				{label}: {Math.round(wet * 100)}%
			</label>
			<input
				type='range'
				min='0'
				max='1'
				step='0.01'
				value={wet}
				onChange={(e) => setWet(Number(e.target.value))}
				className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
			/>
			<div className='flex justify-between text-xs text-gray-500 mt-1'>
				<span>Dry</span>
				<span>Wet</span>
			</div>
		</div>
	);
};
