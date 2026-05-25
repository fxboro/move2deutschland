import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  variant?: 'brand' | 'light' | 'dark'; // brand is Prussian Blue/white (respects dark mode), light is white, dark is slate-900
  className?: string;
  noLink?: boolean;
}

export default function Logo({ size = 'md', variant = 'brand', className = '', noLink = false }: LogoProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl',
  };

  const colorClasses = {
    brand: 'text-slate-900 dark:text-white md:text-white', // default fits transparent navbar but adapts
    light: 'text-white',
    dark: 'text-prussian-blue dark:text-white',
  };

  const logoContent = (
    <span className={`font-heading font-bold tracking-tight select-none ${sizeClasses[size]} ${colorClasses[variant]} ${className}`}>
      move<span className="text-gold">2</span>deutschland
    </span>
  );

  if (noLink) {
    return logoContent;
  }

  return (
    <Link to="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
      {logoContent}
    </Link>
  );
}
