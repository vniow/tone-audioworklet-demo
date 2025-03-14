import { ReactNode } from 'react'

/**
 * Props for the EffectSection component
 */
interface EffectSectionProps {
	/**
	 * Title of the effect section
	 */
	title: string;

	/**
	 * Child components to render within the effect section
	 */
	children: ReactNode;

	/**
	 * Additional CSS classes for the section container
	 */
	className?: string;
}

/**
 * A component that wraps audio effect controls in a standardized section
 *
 * This component provides consistent styling for different effect groups
 * with a section title and divider.
 */
export const EffectSection = ({
	title,
	children,
	className = '',
}: EffectSectionProps) => {
	return (
		<div className={`pt-3 border-t border-gray-200 ${className}`}>
			<h3 className='font-medium text-xs text-gray-700 mb-2'>{title}</h3>
			{children}
		</div>
	);
};
