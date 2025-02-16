import { useToneWorklet } from '../hooks/useToneWorklet';

interface NoiseControlsProps {
	frequency: number;
	onFrequencyChange: (value: number) => void;
}

function NoiseControls({ frequency, onFrequencyChange }: NoiseControlsProps) {
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
		</div>
	);
}

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
				max='2'
				step='0.01'
				value={gain}
				onChange={(e) => onGainChange(Number(e.target.value))}
				className='slider'
			/>
		</div>
	);
}

export function ToneWorkletCard() {
	const {
		isInitialized,
		isPlaying,
		controls,
		gainValue,
		error,
		initialize,
		togglePlayback,
		updateFrequency,
		updateGain,
	} = useToneWorklet();

	return (
		<div className='processor-card'>
			<h2>Tone.js Worklet Noise</h2>
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
					Initialize Worklet
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
						<NoiseControls
							frequency={controls.frequency}
							onFrequencyChange={updateFrequency}
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
