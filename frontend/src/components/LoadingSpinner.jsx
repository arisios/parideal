import React from 'react';

export default function LoadingSpinner({ size = 'md', text = '' }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizes[size]} rounded-full border-3 border-transparent animate-spin`}
        style={{
          borderTopColor: '#C21874',
          borderRightColor: '#6F2DA8',
          borderWidth: '3px',
          borderStyle: 'solid',
        }}
      />
      {text && (
        <p className="text-sm font-medium" style={{ color: '#6F2DA8' }}>
          {text}
        </p>
      )}
    </div>
  );
}
