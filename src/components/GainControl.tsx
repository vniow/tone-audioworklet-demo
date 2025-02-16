interface GainControlProps {
	gain: number;
	onGainChange: (value: number) => void;
}

export function GainControl({ gain, onGainChange }: GainControlProps) {
	return (
		<div className='control-group'>
			<label className='control-label'>Gain: {gain.toFixed(2)}</label>
			<input
				type='range'
				min='0'
				max='1'
				step='0.01'
				value={gain}
				onChange={(e) => onGainChange(Number(e.target.value))}
				className='slider'
			/>
		</div>
	);
}
