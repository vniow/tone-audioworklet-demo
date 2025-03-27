import { useEffect, useState } from 'react'

export function ThemeToggle() {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		// set initial state based on data-theme attribute
		setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
	}, []);

	const toggleTheme = () => {
		if (isDark) {
			// switch to light theme
			document.documentElement.removeAttribute('data-theme');
			localStorage.theme = 'light';
		} else {
			// switch to dark theme
			document.documentElement.setAttribute('data-theme', 'dark');
			localStorage.theme = 'dark';
		}
		setIsDark(!isDark);
	};

	return (
		<button
			onClick={toggleTheme}
			className='fixed top-4 right-4 p-2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
			aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			{isDark ? (
				<svg
					className='w-5 h-5'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
					/>
				</svg>
			) : (
				<svg
					className='w-5 h-5'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
					/>
				</svg>
			)}
		</button>
	);
}
