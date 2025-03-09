import './App.css'

import BitCrusherCard from './components/BitCrusherCard'
import BitCrusherDelayCard from './components/BitCrusherDelayCard'
import DelayCard from './components/DelayCard'

function App() {
	return (
		<div className='container mx-auto min-h-screen px-4 py-6'>
			<div className='grid gap-6 md:grid-cols-3 lg:grid-cols-6'>
				<BitCrusherCard />
				<DelayCard />
				<BitCrusherDelayCard />
			</div>
		</div>
	);
}

export default App;
