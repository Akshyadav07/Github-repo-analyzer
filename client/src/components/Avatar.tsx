import React, { useState } from 'react';
import { User as UserIcon } from 'lucide-react';

interface AvatarProps {
  src?: string | null;
  alt?: string;
  username?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const iconSizes = {
  xs: 12,
  sm: 14,
  md: 18,
  lg: 22,
  xl: 28,
};

export function Avatar({
  src,
  alt = 'User avatar',
  username,
  size = 'md',
  className = '',
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);
  const [triedFallback, setTriedFallback] = useState(false);

  // Compute primary and fallback sources
  const fallbackUrl = username ? `https://github.com/${username}.png` : undefined;
  const initialSrc = src || fallbackUrl;

  const [currentSrc, setCurrentSrc] = useState<string | undefined>(initialSrc);

  const handleError = () => {
    if (!triedFallback && fallbackUrl && currentSrc !== fallbackUrl) {
      setTriedFallback(true);
      setCurrentSrc(fallbackUrl);
    } else {
      setImgError(true);
    }
  };

  const initial = (username || alt || 'U').charAt(0).toUpperCase();

  if (imgError || !currentSrc) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0 ${className}`}
        style={{
          background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
          border: '2px solid rgba(255, 255, 255, 0.1)',
        }}
        title={username || alt}
      >
        {initial ? initial : <UserIcon size={iconSizes[size]} />}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
      className={`${sizeClasses[size]} rounded-full object-cover flex-shrink-0 border shadow-sm ${className}`}
      style={{
        borderColor: 'rgba(99, 102, 241, 0.3)',
      }}
      loading="lazy"
    />
  );
}
