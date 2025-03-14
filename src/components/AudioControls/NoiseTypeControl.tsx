import React from 'react'

import { NoiseType } from '../../worklets/NoiseProcessor.worklet'

interface NoiseTypeControlProps {
	/**
	 * Current noise type
	 */
	noiseType: NoiseType;

	/**
	 * Function to set the noise type
	 */
	setNoiseType: (type: NoiseType) => void;

	/**
	 * Optional class name for styling
	 */
	className?: string;
}

/**
 * Component for selecting between different noise types
 */
export const NoiseTypeControl: React.FC<NoiseTypeControlProps> = ({
	noiseType,
	setNoiseType,
	className = '',
}) => {
	return (
		<div className={`mb-3 ${className}`}>
			<label className='block text-xs font-medium text-gray-700 mb-1'>
				Noise Type
			</label>
			<div className='flex gap-2'>
				{Object.values(NoiseType).map((type) => (
					<button
						key={type}
						onClick={() => setNoiseType(type)}
						className={`px-2 py-1 text-xs font-medium rounded-md flex-1 ${
							noiseType === type
								? 'bg-indigo-600 text-white'
								: 'bg-gray-200 text-gray-800 hover:bg-gray-300'
						}`}
					>
						{type.charAt(0).toUpperCase() + type.slice(1)}
					</button>
				))}
			</div>
			<p className='mt-1 text-xs text-gray-500'>
				{noiseType === NoiseType.WHITE &&
					'Flat frequency response, highest frequencies'}
				{noiseType === NoiseType.PINK &&
					'1/f spectrum, balanced across octaves'}
				{noiseType === NoiseType.BROWN && 'Low-frequency focused, bass heavy'}
			</p>
		</div>
	);
};
