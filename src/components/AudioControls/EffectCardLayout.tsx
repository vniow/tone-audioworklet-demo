import { ReactNode } from 'react'

import { ButtonControl, ButtonVariant } from './ButtonControl'
import { StatusIndicators } from './StatusIndicators'

/**
 * props for the EffectCardLayout component
 */
interface EffectCardLayoutProps {
	/**
	 * title of the card
	 */
	title: string;

	/**
	 * are those audio nodes initialized
	 */
	isInitialized: boolean;

	/**
	 * is the audio playing
	 */
	isPlaying: boolean;

	/**
	 * playback on/off
	 */
	onPlay: () => void;

	/**
	 * trigger debug state
	 */
	onDebug: () => void;

	/**
	 * what goes inside the card
	 */
	children: ReactNode;
}

/**
 * this component provides a card layout with title,
 * status indicators, play/stop controls, and debug functionality
 */
export const EffectCardLayout = ({
	title,
	isInitialized,
	isPlaying,
	onPlay,
	onDebug,
	children,
}: EffectCardLayoutProps) => {
	return (
		<div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-md transition-colors'>
			<div className='min-h-[3rem] mb-4'>
				<h2 className='text-sm font-semibold text-gray-900 dark:text-white'>
					{title}
				</h2>
			</div>

			<div className='space-y-3 text-xs'>
				<StatusIndicators
					isInitialized={isInitialized}
					isPlaying={isPlaying}
				/>

				{/* play/stop button */}
				<ButtonControl
					onClick={onPlay}
					variant={isPlaying ? ButtonVariant.DANGER : ButtonVariant.SUCCESS}
				>
					{isPlaying ? 'Stop' : 'Play'}
				</ButtonControl>

				{/* debug button */}
				<ButtonControl
					onClick={onDebug}
					variant={ButtonVariant.INFO}
				>
					debug state
				</ButtonControl>

				{children}
			</div>
		</div>
	);
};
