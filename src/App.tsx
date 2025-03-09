import './App.css'

import BitCrusherCard from './components/BitCrusherCard'
import DelayCard from './components/DelayCard'
import SimpleOscillatorCard from './components/SimpleOscillatorCard'

function App() {
	return (
		<div className='container mx-auto min-h-screen px-4 py-8'>
			<h1 className='mb-8 text-center'>Audio Processing Demo</h1>

			<div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
				<SimpleOscillatorCard />
				<BitCrusherCard />
				<DelayCard />
			</div>
		</div>
	);
}

export default App;
