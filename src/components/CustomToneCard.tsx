import { useCustomTone } from '../hooks/useCustomTone';

type NoiseType = 'white' | 'brown' | 'pink';

interface NoiseSelectProps {
	value: NoiseType;
	onChange: (value: NoiseType) => void;
	disabled?: boolean;
}

function NoiseSelect({ value, onChange, disabled }: NoiseSelectProps) {
	return (
		<div className='control-group'>
			<label className='control-label'>Noise Type</label>
			<select
				value={value}
				onChange={(e) => onChange(e.target.value as NoiseType)}
				className='select-input'
				disabled={disabled}
			>
				<option value='white'>White</option>
				<option value='pink'>Pink</option>
				<option value='brown'>Brown</option>
			</select>
		</div>
	);
}

interface GainControlProps {
	gain: number;
	onGainChange: (value: number) => void;
	disabled?: boolean;
}

function GainControl({ gain, onGainChange, disabled }: GainControlProps) {
	return (
		<div className='control-group'>
			<label className='control-label'>Gain: {gain.toFixed(2)}</label>
			<input
				type='range'
				min='0'
				max='2'
				step='0.01'
				value={gain}
				onChange={(e) => onGainChange(Number(e.target.value))}
				className='slider'
				disabled={disabled}
			/>
		</div>
	);
}

export function CustomToneCard() {
	const {
		isInitialized,
		isPlaying,
		noiseType,
		gainValue,
		error,
		initialize,
		togglePlayback,
		updateNoiseType,
		updateGain,
	} = useCustomTone();

	return (
		<div className='processor-card'>
			<h2>Custom Tone.js Node</h2>
			<div className='status-panel'>
				<div className='status-item'>
					<span>Status:</span>
					<span className={isInitialized ? 'status-active' : 'status-inactive'}>
						{isInitialized ? 'Initialized' : 'Not Initialized'}
					</span>
				</div>
				<div className='status-item'>
					<span>Playback:</span>
					<span className={isPlaying ? 'status-active' : 'status-inactive'}>{isPlaying ? 'Playing' : 'Stopped'}</span>
				</div>
				{error && <div className='error-message'>Error: {error.message}</div>}
			</div>

			<div className='controls'>
				<button
					onClick={initialize}
					disabled={isInitialized}
					className='button'
				>
					Initialize Custom Node
				</button>

				<button
					onClick={togglePlayback}
					disabled={!isInitialized}
					className='button'
				>
					{isPlaying ? 'Stop' : 'Start'} Noise
				</button>

				{isInitialized && (
					<div className='control-panel'>
						<NoiseSelect
							value={noiseType}
							onChange={updateNoiseType}
							disabled={!isInitialized}
						/>
						<GainControl
							gain={gainValue}
							onGainChange={updateGain}
							disabled={!isInitialized}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
