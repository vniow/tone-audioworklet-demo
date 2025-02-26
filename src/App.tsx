import './App.css';

import { useEffect, useState } from 'react';

import { AudioCard } from './components/AudioCard';
import { initializeAudio } from './lib/initializeAudio';

function App() {
	const [initializing, setInitializing] = useState(true);
	const [initError, setInitError] = useState<Error | null>(null);

	useEffect(() => {
		// Pre-initialize audio on app load
		initializeAudio()
			.then(() => setInitializing(false))
			.catch((error) => {
				console.error('Failed to initialize audio context:', error);
				setInitError(error);
				setInitializing(false);
			});
	}, []);

	return (
		<div className='container mx-auto min-h-screen px-4 py-8'>
			<h1 className='mb-8 text-center'>Audio Processing Demo</h1>
			{initError ? (
				<div className='p-4 bg-red-100 text-red-700 rounded mb-6'>
					Failed to initialize audio context. Please check that your browser supports AudioWorklet.
				</div>
			) : null}
			<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
				<AudioCard />
			</div>
		</div>
	);
}

export default App;
