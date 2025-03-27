import { ReactNode } from 'react'

/**
 * props
 */
interface EffectSectionProps {
	/**
	 * title
	 */
	title: string;

	/**
	 * what goes inside the section
	 */
	children: ReactNode;

	/**
	 * additional CSS classes for the section container
	 */
	className?: string;
}

/**
 * component to render a section for audio effect controls
 */
export const EffectSection = ({
	title,
	children,
	className = '',
}: EffectSectionProps) => {
	return (
		<div className={`pt-3 border-t border-gray-200 ${className}`}>
			<h3 className='font-medium text-sm text-gray-700 dark:text-gray-300 mb-2'>
				{title}
			</h3>
			{children}
		</div>
	);
};
