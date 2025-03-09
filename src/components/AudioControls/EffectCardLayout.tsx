import { ReactNode } from 'react'

import { StatusIndicators } from './StatusIndicators'

interface EffectCardLayoutProps {
	title: string;
	isInitialized: boolean;
	isPlaying: boolean;
	onPlay: () => void;
	onDebug: () => void;
	children: ReactNode;
}

export const EffectCardLayout = ({
	title,
	isInitialized,
	isPlaying,
	onPlay,
	onDebug,
	children,
}: EffectCardLayoutProps) => {
	return (
		<div className='bg-white rounded-lg shadow-md p-6 max-w-md'>
			<div className='min-h-[3rem] mb-4'>
				<h2 className='text-sm font-semibold'>{title}</h2>
			</div>

			<div className='space-y-3 text-xs'>
				<StatusIndicators
					isInitialized={isInitialized}
					isPlaying={isPlaying}
				/>
				{/* Play/Stop button */}
				<button
					onClick={onPlay}
					className={`w-full px-3 py-1.5 text-white font-medium rounded-md ${
						isPlaying
							? 'bg-red-500 hover:bg-red-600'
							: 'bg-green-500 hover:bg-green-600'
					}`}
				>
					{isPlaying ? 'Stop' : 'Play'}
				</button>

				{/* Debug button */}
				<button
					onClick={onDebug}
					className='w-full px-3 py-1.5 text-white font-medium rounded-md bg-blue-500 hover:bg-blue-600'
				>
					Debug State
				</button>
				{children}
			</div>
		</div>
	);
};
