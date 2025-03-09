interface StatusIndicatorsProps {
	isInitialized: boolean;
	isPlaying: boolean;
}

export const StatusIndicators = ({
	isInitialized,
	isPlaying,
}: StatusIndicatorsProps) => {
	return (
		<div className='flex justify-between mt-2'>
			<div
				className={`px-2 py-2 rounded text-xs ${
					isInitialized
						? 'bg-green-100 text-green-800'
						: 'bg-yellow-100 text-yellow-800'
				}`}
			>
				{isInitialized ? 'Initialized' : 'Not Initialized'}
			</div>
			<div
				className={`px-2 py-0.5 rounded text-xs ${
					isPlaying
						? 'bg-green-100 text-green-800'
						: 'bg-gray-100 text-gray-800'
				}`}
			>
				Status: {isPlaying ? 'Playing' : 'Stopped'}
			</div>
		</div>
	);
};
