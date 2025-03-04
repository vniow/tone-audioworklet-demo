import { useNoiseGenerator } from '../hooks/useNoiseGenerator'

export const NoiseGeneratorCard = () => {
	const { isPlaying, startNoise, stopNoise, isInitialized } = useNoiseGenerator();

	return (
		<div className='p-4 border rounded-lg shadow-md'>
			<h2 className='text-lg mb-4'>Noise Generator</h2>

			<div className='flex space-x-4'>
				<button
					className={`px-4 py-2 rounded ${
						isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
					} text-white disabled:opacity-50`}
					onClick={isPlaying ? stopNoise : startNoise}
					disabled={!isInitialized}
				>
					{isPlaying ? 'Stop' : 'Start'} Noise
				</button>

				<div className='flex items-center'>
					<span className={`w-2 h-2 rounded-full mr-2 ${isInitialized ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
					{isInitialized ? 'Ready' : 'Initializing...'}
				</div>
			</div>
		</div>
	);
};
