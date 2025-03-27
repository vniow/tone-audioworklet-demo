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
				className={`px-2 py-2 rounded-md text-xs ${
					isInitialized
						? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
						: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
				}`}
			>
				{isInitialized ? 'Initialized' : 'Not Initialized'}
			</div>
			<div
				className={`px-2 py-2 rounded-md text-xs ${
					isPlaying
						? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
						: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
				}`}
			>
				status: {isPlaying ? 'Playing' : 'Stopped'}
			</div>
		</div>
	);
};
