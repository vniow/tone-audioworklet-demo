import { useToneNode } from './useToneOscillatorNode'

type Props = object;

export const AudioCard = (props: Props) => {
	const { isPlaying, startOscillator, stopOscillator } = useToneNode();

	return (
		<div className='p-4 border rounded-lg shadow-md'>
			<h2 className='text-lg mb-4'>Custom Tone Oscillator</h2>
			<button
				onClick={isPlaying ? stopOscillator : startOscillator}
				className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
			>
				{isPlaying ? 'Stop' : 'Start'} Oscillator
			</button>
		</div>
	);
};
