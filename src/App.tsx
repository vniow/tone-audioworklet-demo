import BitCrusherCard from './components/BitCrusherCard'
import BitCrusherDelayCard from './components/BitCrusherDelayCard'
import DelayCard from './components/DelayCard'
import NoiseCard from './components/NoiseCard'
import { ThemeToggle } from './components/ThemeToggle'

function App() {
	return (
		<div className='grid gap-6 md:grid-cols-3 lg:grid-cols-4 mx-auto p-8 text-center min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200'>
			<ThemeToggle />
			<BitCrusherCard />
			<DelayCard />
			<BitCrusherDelayCard />
			<NoiseCard />
		</div>
	);
}

export default App;
