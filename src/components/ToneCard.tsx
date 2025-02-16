interface StatusItem {
	label: string;
	isActive: boolean;
	activeText: string;
	inactiveText: string;
}

interface ToneCardProps {
	title: string;
	statusItems: StatusItem[];
	error: Error | null;
	children: React.ReactNode;
}

export function ToneCard({ title, statusItems, error, children }: ToneCardProps) {
	return (
		<div className='processor-card'>
			<h2>{title}</h2>
			<div className='status-panel'>
				{statusItems.map((item, index) => (
					<div
						key={index}
						className='status-item'
					>
						<span>{item.label}:</span>
						<span className={item.isActive ? 'status-active' : 'status-inactive'}>
							{item.isActive ? item.activeText : item.inactiveText}
						</span>
					</div>
				))}
				{error && <div className='error-message'>Error: {error.message}</div>}
			</div>

			<div className='controls'>{children}</div>
		</div>
	);
}
