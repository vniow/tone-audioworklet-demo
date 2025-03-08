import { useCallback, useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';

// SimpleOscillatorCard component - a self-contained card with oscillator and gain controls
const SimpleOscillatorCard = () => {
	// State for UI controls
	const [isPlaying, setIsPlaying] = useState(false);
	const [frequency, setFrequency] = useState(440);
	const [oscillatorType, setOscillatorType] = useState<Tone.ToneOscillatorType>('sine');
	// Use normalized gain (0-1) with default 0.25 instead of dB
	const [gain, setGain] = useState(0.25);
	const [isInitialized, setIsInitialized] = useState(false);

	// References to audio nodes
	const oscillatorRef = useRef<Tone.Oscillator | null>(null);
	const gainNodeRef = useRef<Tone.Gain | null>(null);

	// HOOK 1: Initialize audio nodes once and handle cleanup
	useEffect(() => {
		console.log('🔄 Initial setup of audio nodes');

		// Create both nodes at once
		const gainNode = new Tone.Gain(gain).toDestination();
		const osc = new Tone.Oscillator(frequency, oscillatorType).connect(gainNode);

		// Store references
		oscillatorRef.current = osc;
		gainNodeRef.current = gainNode;
		setIsInitialized(true);

		console.log('✅ Audio setup complete!', { osc, gainNode });

		// Cleanup when component unmounts
		return () => {
			console.log('🧹 Cleaning up audio nodes');
			if (oscillatorRef.current) {
				if (oscillatorRef.current.state === 'started') {
					oscillatorRef.current.stop();
				}
				oscillatorRef.current.dispose();
			}
			if (gainNodeRef.current) {
				gainNodeRef.current.dispose();
			}
		};
	}, []); // Empty dependency array = run once on mount

	// HOOK 2: Handle all parameter changes and playback state in a single hook
	useEffect(() => {
		const osc = oscillatorRef.current;
		const gainNode = gainNodeRef.current;

		if (!osc || !gainNode) return;

		console.log('⚙️ Updating parameters:', { frequency, oscillatorType, gain, isPlaying });

		// Update oscillator parameters
		osc.frequency.value = frequency;
		osc.type = oscillatorType;

		// Update gain parameter (using linear scale 0-1 instead of dB)
		gainNode.gain.value = gain;

		// Handle playback state
		if (isPlaying && osc.state !== 'started') {
			console.log('▶️ Starting oscillator');
			osc.start();
		} else if (!isPlaying && osc.state === 'started') {
			console.log('⏹️ Stopping oscillator');
			osc.stop();
		}
	}, [frequency, oscillatorType, gain, isPlaying]); // Only re-run when these values change

	// Toggle oscillator playback
	const togglePlayback = useCallback(async () => {
		console.log('🎮 Toggle playback button pressed');

		try {
			// Start audio context if needed
			await Tone.start();

			// Simply toggle the state - the effect will handle the actual start/stop
			setIsPlaying((prev) => !prev);
		} catch (error) {
			console.error('❌ Error toggling playback:', error);
		}
	}, []);

	// Add a debug button to check component state
	const debugState = () => {
		console.log('🔍 Debug State:');
		console.log('  - isPlaying:', isPlaying);
		console.log('  - isInitialized:', isInitialized);
		console.log('  - frequency:', frequency);
		console.log('  - oscillatorType:', oscillatorType);
		console.log('  - gain:', gain, '(linear)');

		if (oscillatorRef.current) {
			console.log('  - Oscillator state:', {
				type: oscillatorRef.current.type,
				frequency: oscillatorRef.current.frequency.value,
				state: oscillatorRef.current.state,
			});
		}

		console.log('  - Tone.js context state:', Tone.getContext().state);
	};

	return (
		<div className='bg-white rounded-lg shadow-md p-6 max-w-md'>
			<h2 className='text-xl font-bold mb-4'>Simple Oscillator</h2>

			<div className='space-y-4'>
				{/* Frequency control */}
				<div>
					<label className='block text-sm font-medium text-gray-700'>Frequency: {frequency} Hz</label>
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
					<label className='block text-sm font-medium text-gray-700 mb-1'>Oscillator Type</label>
					<select
						value={oscillatorType}
						onChange={(e) => setOscillatorType(e.target.value as Tone.ToneOscillatorType)}
						className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500'
					>
						<option value='sine'>Sine</option>
						<option value='square'>Square</option>
						<option value='sawtooth'>Sawtooth</option>
						<option value='triangle'>Triangle</option>
					</select>
				</div>

				{/* Gain control - updated to use 0-1 range */}
				<div>
					<label className='block text-sm font-medium text-gray-700'>Volume: {Math.round(gain * 100)}%</label>
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
						isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
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
