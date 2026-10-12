import React from 'react';
import { getIndianVehicleImage } from '../utils/vehicleAssets';

interface IndianVehicleBadgeProps {
  vehicleType: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
  showBorder?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 rounded-lg',
  sm: 'w-8 h-8 rounded-xl',
  md: 'w-12 h-12 rounded-2xl',
  lg: 'w-16 h-16 rounded-2xl',
  xl: 'w-24 h-24 rounded-3xl',
};

export const IndianVehicleBadge: React.FC<IndianVehicleBadgeProps> = ({
  vehicleType,
  className = '',
  size = 'md',
  alt = 'भारतीय वाहन',
  showBorder = true,
}) => {
  const imageSrc = getIndianVehicleImage(vehicleType);

  return (
    <div
      className={`relative overflow-hidden shrink-0 bg-zinc-900 flex items-center justify-center ${
        showBorder ? 'border border-amber-500/30 shadow-md shadow-black/40' : ''
      } ${sizeClasses[size]} ${className}`}
    >
      <img
        src={imageSrc}
        alt={alt}
        referrerPolicy="no-referrer"
        className="w-full h-full object-cover select-none pointer-events-none transform hover:scale-105 transition-transform duration-300"
        loading="lazy"
      />
    </div>
  );
};
