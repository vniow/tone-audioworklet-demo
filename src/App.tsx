import './App.css';

import { useRef } from 'react';

import { NoiseControls } from './components/NoiseControls';
import { ProcessorCard } from './components/ProcessorCard';
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
			<h1>Audio Worklet Demos</h1>

			<div className='processors-grid'>
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
				</ProcessorCard>

				{/* Noise Generator */}
				<ProcessorCard
					title='Noise Generator'
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
						<NoiseControls
							frequency={noiseProcessor.controls.frequency ?? 440}
							amplitude={noiseProcessor.controls.amplitude ?? 0.5}
							onFrequencyChange={(value) => noiseProcessor.updateControl?.('frequency', value)}
							onAmplitudeChange={(value) => noiseProcessor.updateControl?.('amplitude', value)}
						/>
					)}
				</ProcessorCard>
			</div>
		</div>
	);
}

export default App;
