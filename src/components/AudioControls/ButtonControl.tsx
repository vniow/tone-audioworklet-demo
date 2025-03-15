import { ReactNode } from 'react'

/**
 * Button variant types for different visual styles
 */
export enum ButtonVariant {
	PRIMARY = 'primary',
	SECONDARY = 'secondary',
	SUCCESS = 'success',
	DANGER = 'danger',
	INFO = 'info',
}

/**
 * Props for the ButtonControl component
 */
interface ButtonControlProps {
	/**
	 * Button click handler
	 */
	onClick: () => void;

	/**
	 * Button label or content
	 */
	children: ReactNode;

	/**
	 * Visual style variant
	 * @default ButtonVariant.PRIMARY
	 */
	variant?: ButtonVariant;

	/**
	 * Whether the button should take full width
	 * @default true
	 */
	fullWidth?: boolean;

	/**
	 * Additional CSS classes
	 */
	className?: string;

	/**
	 * Whether the button is disabled
	 * @default false
	 */
	disabled?: boolean;
}

/**
 * A reusable button component with standardized styling
 *
 * This component provides consistent button styles across the application
 * with configurable variants for different actions.
 */
export const ButtonControl = ({
	onClick,
	children,
	variant = ButtonVariant.PRIMARY,
	fullWidth = true,
	className = '',
	disabled = false,
}: ButtonControlProps) => {
	// Map variants to TailwindCSS classes with dark mode support
	const variantStyles = {
		[ButtonVariant.PRIMARY]:
			'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700',
		[ButtonVariant.SECONDARY]:
			'bg-gray-500 hover:bg-gray-600 text-white dark:bg-gray-600 dark:hover:bg-gray-700',
		[ButtonVariant.SUCCESS]:
			'bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700',
		[ButtonVariant.DANGER]:
			'bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700',
		[ButtonVariant.INFO]:
			'bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700',
	};

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`
        px-3 py-1.5 
        font-medium rounded-md 
        transition-colors
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
		>
			{children}
		</button>
	);
};
