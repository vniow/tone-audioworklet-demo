import { ReactNode } from 'react'

import { ButtonControl, ButtonVariant } from './ButtonControl'
import { StatusIndicators } from './StatusIndicators'

/**
 * Props for the EffectCardLayout component
 */
interface EffectCardLayoutProps {
	/**
	 * Title of the effect card
	 */
	title: string;

	/**
	 * Whether the audio nodes are initialized
	 */
	isInitialized: boolean;

	/**
	 * Whether the audio is playing
	 */
	isPlaying: boolean;

	/**
	 * Function to toggle playback on/off
	 */
	onPlay: () => void;

	/**
	 * Function to trigger debugging output
	 */
	onDebug: () => void;

	/**
	 * Child components to render within the card
	 */
	children: ReactNode;
}

/**
 * A standardized layout component for audio effect panels
 *
 * This component provides a consistent card layout with title,
 * status indicators, play/stop controls, and debug functionality.
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
				<ButtonControl
					onClick={onPlay}
					variant={isPlaying ? ButtonVariant.DANGER : ButtonVariant.SUCCESS}
				>
					{isPlaying ? 'Stop' : 'Play'}
				</ButtonControl>

				{/* Debug button */}
				<ButtonControl
					onClick={onDebug}
					variant={ButtonVariant.INFO}
				>
					Debug State
				</ButtonControl>

				{children}
			</div>
		</div>
	);
};
