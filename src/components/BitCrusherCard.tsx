import { useCallback, useEffect, useRef } from 'react'
import * as Tone from 'tone'

import { useBitCrusherWorklet } from '../hooks/useBitCrusherWorklet'
import { useGain } from '../hooks/useGain'
import { useOscillator } from '../hooks/useOscillator'

// BitCrusherCard component - now using separate hooks
const BitCrusherCard = () => {
	// Track if nodes have been connected
	const nodesConnectedRef = useRef(false);

	// Initialize the bitcrusher worklet
	const {
		bits,
		setBits,
		wet, // Extract wet parameter
		setWet, // Extract setWet function
		bitCrusherNode,
		isInitialized: isBitCrusherInitialized,
	} = useBitCrusherWorklet({ bits: 4, wet: 0.75 }); // Initialize with default wet value

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
	const isInitialized =
		isGainInitialized && isOscInitialized && isBitCrusherInitialized;

	// Connect nodes only once when all are initialized
	useEffect(() => {
		if (
			isInitialized &&
			oscillator &&
			gainNode &&
			bitCrusherNode &&
			!nodesConnectedRef.current
		) {
			console.log('🔌 Connecting audio nodes...');
			// Disconnect any existing connections first
			oscillator.disconnect();
			gainNode.disconnect();
			bitCrusherNode.disconnect();

			// Connect oscillator -> gainNode -> bitCrusherNode -> output
			oscillator.connect(gainNode);
			gainNode.connect(bitCrusherNode);
			bitCrusherNode.toDestination();

			// Mark as connected
			nodesConnectedRef.current = true;
		}

		// Clean up connections on unmount
		return () => {
			if (nodesConnectedRef.current) {
				console.log('🧹 Cleaning up audio connections');
				if (oscillator) oscillator.disconnect();
				if (gainNode) gainNode.disconnect();
				if (bitCrusherNode) bitCrusherNode.disconnect();
				nodesConnectedRef.current = false;
			}
		};
	}, [isInitialized, oscillator, gainNode, bitCrusherNode]);

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
		console.log('  - bit depth:', bits);
		console.log('  - wet/dry mix:', wet);
		console.log('  - bitCrusherNode:', bitCrusherNode);
		console.log('  - gainNode:', gainNode);
		console.log('  - oscillator:', oscillator);
	};

	return (
		<div className='bg-white rounded-lg shadow-md p-6 max-w-md'>
			<h2 className='text-xl font-bold mb-4'>BitCrusher Effect</h2>

			<div className='space-y-4'>
				{/* Frequency control */}
				<div>
					<label className='block text-sm font-medium text-gray-700'>
						Oscillator frequency: {frequency} Hz
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

				{/* BitCrusher section with divider */}
				<div className='pt-3 border-t border-gray-200'>
					<h3 className='font-medium text-gray-700 mb-2'>BitCrusher Effect</h3>

					{/* Bit depth control */}
					<div className='mb-3'>
						<label className='block text-sm font-medium text-gray-700'>
							Bit Depth: {bits} bits
						</label>
						<input
							type='range'
							min='1'
							max='16'
							step='1'
							value={bits}
							onChange={(e) => setBits(Number(e.target.value))}
							className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
						/>
					</div>

					{/* Wet/Dry mix control - New slider */}
					<div>
						<label className='block text-sm font-medium text-gray-700'>
							Effect Mix: {Math.round(wet * 100)}%
						</label>
						<input
							type='range'
							min='0'
							max='1'
							step='0.01'
							value={wet}
							onChange={(e) => setWet(Number(e.target.value))}
							className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer'
						/>
						<div className='flex justify-between text-xs text-gray-500 mt-1'>
							<span>Dry</span>
							<span>Wet</span>
						</div>
					</div>
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

export default BitCrusherCard;
