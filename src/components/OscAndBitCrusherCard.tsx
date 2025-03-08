import { useCustomOscAndBitCrusher } from '../hooks/useCustomOscAndBitCrusher'

export const CustomOscAndBitCrusherCard = () => {
	const { isPlaying, startOscillator, stopOscillator, isInitialized } = useCustomOscAndBitCrusher();

	return (
		<div className='p-4 border rounded-lg shadow-md'>
			<h2 className='text-lg mb-4'>Custom Tone Oscillator + BitCrusher</h2>
			<button
				onClick={isPlaying ? stopOscillator : startOscillator}
				disabled={!isInitialized}
				className={`px-4 py-2 ${isInitialized ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'} text-white rounded`}
			>
				{!isInitialized ? 'Loading...' : isPlaying ? 'Stop' : 'Start'} Oscillator
			</button>
		</div>
	);
};
