import './App.css';

import { useRef } from 'react';

import { CustomToneCard } from './components/CustomToneCard';
import { GainControl } from './components/GainControl';
import { NoiseControls } from './components/NoiseControls';
import { ProcessorCard } from './components/ProcessorCard';
import { ToneNoiseCard } from './components/ToneNoiseCard';
import { useWorkletProcessor } from './hooks/useWorkletProcessor';
import atanProcessorUrl from './worklets/audio-processor.ts?url';
import noiseWorkletUrl from './worklets/noise-worklet.ts?url';

function App() {
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Audio File Processor
	const audioProcessor = useWorkletProcessor({
		name: 'atan-processor',
		url: atanProcessorUrl,
		type: 'file',
	});

	// Noise Generator
	const noiseProcessor = useWorkletProcessor({
		name: 'noise-worklet',
		url: noiseWorkletUrl,
		type: 'generator',
	});

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && files.length > 0) {
			await audioProcessor.processFile?.(files[0]);
		}
	};

	return (
		<div className='container'>
			<h1>Audio Processing Demo</h1>

			<div className='processors-grid'>
				{/* Custom Tone.js Node */}
				<CustomToneCard />

				{/* Tone.js Noise Generator */}
				<ToneNoiseCard />

				{/* Audio File Processor */}
				<ProcessorCard
					title='Audio File Processor'
					statusItems={[
						{
							label: 'Status',
							isActive: audioProcessor.isInitialized,
							activeText: 'Initialized',
							inactiveText: 'Not Initialized',
						},
						{
							label: 'Processing',
							isActive: audioProcessor.isActive,
							activeText: 'Active',
							inactiveText: 'Inactive',
						},
					]}
					error={audioProcessor.error}
				>
					<button
						onClick={audioProcessor.initialize}
						disabled={audioProcessor.isInitialized}
						className='button'
					>
						Initialize Audio Processor
					</button>

					<input
						ref={fileInputRef}
						type='file'
						accept='audio/*'
						onChange={handleFileChange}
						disabled={!audioProcessor.isInitialized}
						className='file-input'
					/>

					{audioProcessor.isInitialized && (
						<div className='control-panel'>
							<GainControl
								gain={audioProcessor.controls.gain}
								onGainChange={audioProcessor.updateGain}
							/>
						</div>
					)}
				</ProcessorCard>

				{/* AudioWorklet Noise Generator */}
				<ProcessorCard
					title='AudioWorklet Noise Generator'
					statusItems={[
						{
							label: 'Status',
							isActive: noiseProcessor.isInitialized,
							activeText: 'Initialized',
							inactiveText: 'Not Initialized',
						},
						{
							label: 'Playing',
							isActive: noiseProcessor.isActive,
							activeText: 'Active',
							inactiveText: 'Stopped',
						},
					]}
					error={noiseProcessor.error}
				>
					<button
						onClick={noiseProcessor.initialize}
						disabled={noiseProcessor.isInitialized}
						className='button'
					>
						Initialize Noise Generator
					</button>

					<button
						onClick={noiseProcessor.toggleActive}
						disabled={!noiseProcessor.isInitialized}
						className='button'
					>
						{noiseProcessor.isActive ? 'Stop' : 'Start'} Noise
					</button>

					{noiseProcessor.isInitialized && (
						<div className='control-panel'>
							<NoiseControls
								frequency={noiseProcessor.controls.frequency ?? 440}
								amplitude={noiseProcessor.controls.amplitude ?? 0.5}
								onFrequencyChange={(value) => noiseProcessor.updateControl?.('frequency', value)}
								onAmplitudeChange={(value) => noiseProcessor.updateControl?.('amplitude', value)}
							/>
							<GainControl
								gain={noiseProcessor.controls.gain}
								onGainChange={noiseProcessor.updateGain}
							/>
						</div>
					)}
				</ProcessorCard>
			</div>
		</div>
	);
}

export default App;
