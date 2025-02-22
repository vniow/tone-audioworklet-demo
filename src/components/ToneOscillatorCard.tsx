import { useOscillator } from '../hooks/useOscillator'

interface GainControlProps {
	gain: number;
	onGainChange: (value: number) => void;
}

function GainControl({ gain, onGainChange }: GainControlProps) {
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

export function ToneOscillatorCard() {
	const { isInitialized, isPlaying, gainValue, error, initialize, togglePlayback, updateGain } = useOscillator();

	return (
		<div className='processor-card'>
			<h2>Tone.js Oscillator</h2>
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
					Initialize Oscillator
				</button>

				<button
					onClick={togglePlayback}
					disabled={!isInitialized}
					className='button'
				>
					{isPlaying ? 'Stop' : 'Start'} Oscillator
				</button>

				{isInitialized && (
					<div className='control-panel'>
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
