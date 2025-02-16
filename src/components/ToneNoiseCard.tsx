import { useTone } from '../hooks/useTone';
import { GainControl } from './GainControl';

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

export function ToneNoiseCard() {
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
	} = useTone();

	return (
		<div className='processor-card'>
			<h2>Tone.js Noise Generator</h2>
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
					Initialize Tone.js
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
						/>
					</div>
				)}
			</div>
		</div>
	);
}
