import { useCustomNode } from '../hooks/useCustomNode'

export function CustomNodeCard() {
	const { isInitialized, isPlaying, error, initialize, togglePlayback } = useCustomNode();

	return (
		<div className='processor-card'>
			<h2>Custom Tone Node</h2>
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
			</div>
		</div>
	);
}
