import './App.css';

import { ToneWorkletCard } from './components/ToneWorkletCard';

function App() {
	return (
		<div className='container'>
			<h1>Audio Processing Demo</h1>

			<div className='processors-grid'>
				<ToneWorkletCard />
				<ToneWorkletCard />
			</div>
		</div>
	);
}

export default App;
