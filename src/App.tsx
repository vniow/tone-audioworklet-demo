import './App.css';

import { BlarghWorkletCard } from './components/BlarghWorkletCard';
import { ToneWorkletCard } from './components/ToneWorkletCard';

function App() {
	return (
		<div className='container'>
			<h1>Audio Processing Demo</h1>

			<div className='processors-grid'>
				<ToneWorkletCard />
				<BlarghWorkletCard />
			</div>
		</div>
	);
}

export default App;
