import { useFilteredNoiseNode } from '../hooks/useFilteredNoiseNode'

interface FilterControlsProps {
	cutoff: number;
	q: number;
	onCutoffChange: (value: number) => void;
	onQChange: (value: number) => void;
}

function FilterControls({ cutoff, q, onCutoffChange, onQChange }: FilterControlsProps) {
	return (
		<div className='control-panel'>
			<div className='control-group'>
				<label className='control-label'>Cutoff: {cutoff.toFixed(0)} Hz</label>
				<input
					type='range'
					min='20'
					max='20000'
					step='1'
					value={cutoff}
					onChange={(e) => onCutoffChange(Number(e.target.value))}
					className='slider'
				/>
			</div>
			<div className='control-group'>
				<label className='control-label'>Q: {q.toFixed(1)}</label>
				<input
					type='range'
					min='0.1'
					max='20'
					step='0.1'
					value={q}
					onChange={(e) => onQChange(Number(e.target.value))}
					className='slider'
				/>
			</div>
		</div>
	);
}

export function FilteredNoiseCard() {
	const { isInitialized, isPlaying, cutoff, q, error, initialize, togglePlayback, updateCutoff, updateQ } =
		useFilteredNoiseNode();

	return (
		<div className='processor-card'>
			<h2>Filtered Noise</h2>
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
					Initialize Node
				</button>

				<button
					onClick={togglePlayback}
					disabled={!isInitialized}
					className='button'
				>
					{isPlaying ? 'Stop' : 'Start'} Node
				</button>

				{isInitialized && (
					<FilterControls
						cutoff={cutoff}
						q={q}
						onCutoffChange={updateCutoff}
						onQChange={updateQ}
					/>
				)}
			</div>
		</div>
	);
}
