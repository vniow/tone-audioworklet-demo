interface NoiseControlsProps {
	frequency: number;
	amplitude: number;
	onFrequencyChange: (value: number) => void;
	onAmplitudeChange: (value: number) => void;
}

export function NoiseControls({ frequency, amplitude, onFrequencyChange, onAmplitudeChange }: NoiseControlsProps) {
	return (
		<div className='control-panel'>
			<div className='control-group'>
				<label className='control-label'>Frequency: {frequency.toFixed(0)}Hz</label>
				<input
					type='range'
					min='20'
					max='2000'
					value={frequency}
					onChange={(e) => onFrequencyChange(Number(e.target.value))}
					className='slider'
				/>
			</div>

			<div className='control-group'>
				<label className='control-label'>Amplitude: {amplitude.toFixed(2)}</label>
				<input
					type='range'
					min='0'
					max='1'
					step='0.01'
					value={amplitude}
					onChange={(e) => onAmplitudeChange(Number(e.target.value))}
					className='slider'
				/>
			</div>
		</div>
	);
}
