import { useCallback } from 'react'
import * as Tone from 'tone'

import { useGain } from '../hooks/useGain'
import { useOscillator } from '../hooks/useOscillator'

// SimpleOscillatorCard component - now using separate hooks
const SimpleOscillatorCard = () => {
	// Initialize the gain node first (will connect to destination)
	const {
		gain,
		setGain,
		gainNode,
		isInitialized: isGainInitialized,
	} = useGain({ gain: 0.25 });
	// Initialize the oscillator and connect it to the gain node
	const {
		oscillator,
		isPlaying,
		startOscillator,
		stopOscillator,
		setFrequency,
		setType,
		frequency,
		type,
		isInitialized: isOscInitialized,
	} = useOscillator({ frequency: 440, type: 'sine' });

	// Overall initialization state
	const isInitialized = isGainInitialized && isOscInitialized;
	if (isInitialized && oscillator && gainNode) {
		// Connect oscillator to gain node
		oscillator.connect(gainNode);
		gainNode.toDestination();
	}
	// Toggle oscillator playback
	const togglePlayback = useCallback(async () => {
		// Start audio context if needed
		await Tone.start();

		if (isPlaying) {
			stopOscillator();
		} else {
			startOscillator();
		}
	}, [isPlaying, startOscillator, stopOscillator]);

	// Debug state helper
	const debugState = () => {
		console.log('🔍 Debug State:');
		console.log('  - isPlaying:', isPlaying);
		console.log('  - isInitialized:', isInitialized);
		console.log('  - frequency:', frequency);
		console.log('  - type:', type);
		console.log('  - gain:', gain, '(linear)');
		console.log('  - Tone.js context state:', Tone.getContext().state);
	};

	return (
		<div className='bg-white rounded-lg shadow-md p-6 max-w-md'>
			<h2 className='text-xl font-bold mb-4'>Simple Oscillator</h2>

			<div className='space-y-4'>
				{/* Frequency control */}
				<div>
					<label className='block text-sm font-medium text-gray-700'>
						Frequency: {frequency} Hz
					</label>
					<input
						type='range'
						min='20'
						max='2000'
						step='1'
						value={frequency}
						onChange={(e) => setFrequency(Number(e.target.value))}
						className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
					/>
				</div>

				{/* Oscillator type selector */}
				<div>
					<label className='block text-sm font-medium text-gray-700 mb-1'>
						Oscillator Type
					</label>
					<select
						value={type}
						onChange={(e) => setType(e.target.value as Tone.ToneOscillatorType)}
						className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
					>
						<option value='sine'>Sine</option>
						<option value='square'>Square</option>
						<option value='sawtooth'>Sawtooth</option>
						<option value='triangle'>Triangle</option>
					</select>
				</div>

				{/* Gain control */}
				<div>
					<label className='block text-sm font-medium text-gray-700'>
						Volume: {Math.round(gain * 100)}%
					</label>
					<input
						type='range'
						min='0'
						max='1'
						step='0.01'
						value={gain}
						onChange={(e) => setGain(Number(e.target.value))}
						className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
					/>
				</div>

				{/* Play/Stop button */}
				<button
					onClick={togglePlayback}
					className={`w-full px-4 py-2 text-white font-medium rounded-md ${
						isPlaying
							? 'bg-red-500 hover:bg-red-600'
							: 'bg-green-500 hover:bg-green-600'
					}`}
				>
					{isPlaying ? 'Stop' : 'Play'}
				</button>

				{/* Debug button */}
				<button
					onClick={debugState}
					className='w-full px-4 py-2 text-white font-medium rounded-md bg-blue-500 hover:bg-blue-600'
				>
					Debug State
				</button>

				{/* Status indicators */}
				<div className='flex justify-between mt-2 text-sm'>
					<div
						className={`px-2 py-1 rounded ${isInitialized ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
					>
						{isInitialized ? 'Initialized' : 'Not Initialized'}
					</div>
					<div
						className={`px-2 py-1 rounded ${isPlaying ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
					>
						Status: {isPlaying ? 'Playing' : 'Stopped'}
					</div>
				</div>
			</div>
		</div>
	);
};

export default SimpleOscillatorCard;
