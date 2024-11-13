interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'light' | 'dark';
}

export function LoadingSpinner({ size = 'md', color = 'dark' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3'
  };

  const colorClasses = {
    light: 'border-white/20 border-t-white',
    dark: 'border-navy-200 border-t-navy-800'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`
        animate-spin rounded-full
        ${sizeClasses[size]}
        ${colorClasses[color]}
      `}></div>
    </div>
  );
}