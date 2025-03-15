import viteLogo from '/vite.svg'
import { useState } from 'react'

import reactLogo from './assets/react.svg'

function Vite() {
	const [count, setCount] = useState(0);
	return (
		<>
			<div>
				Vite
				<button onClick={() => setCount(count + 1)}>Count: {count}</button>
			</div>
			<div>
				<a
					href='https://vite.dev'
					target='_blank'
				>
					<img
						src={viteLogo}
						className='logo h-24 p-6 inline-block'
						alt='Vite logo'
					/>
				</a>
				<a
					href='https://react.dev'
					target='_blank'
				>
					<img
						src={reactLogo}
						className='logo react h-24 p-6 inline-block animate-spin-slow'
						alt='React logo'
					/>
				</a>
			</div>
			<h1 className='text-5xl font-bold mb-8'>Vite + React</h1>
			<div className='p-8'>
				<button
					onClick={() => setCount((count) => count + 1)}
					className='rounded-lg border border-transparent px-5 py-2.5 bg-slate-200 dark:bg-slate-700 text-base font-medium hover:border-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors duration-200'
				>
					count is {count}
				</button>
				<p className='mt-4'>
					Edit{' '}
					<code className='font-mono bg-slate-100 dark:bg-slate-800 rounded px-1 py-0.5 transition-colors duration-200'>
						src/App.tsx
					</code>{' '}
					and save to test HMR
				</p>
			</div>
			<p className='text-gray-500 dark:text-gray-400'>
				Click on the Vite and React logos to learn more
			</p>
		</>
	);
}

export default Vite;
