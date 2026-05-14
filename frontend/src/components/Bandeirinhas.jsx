import React from 'react';

const CORES = [
  '#C21874', '#6F2DA8', '#007C91', '#D96C2F',
  '#C79A3B', '#1F5F6B', '#4B1E6D', '#C21874',
];

export default function Bandeirinhas({ className = '' }) {
  return (
    <div className={`flag-row ${className}`}>
      {CORES.map((cor, i) => (
        <div
          key={i}
          className="flag-item"
          style={{ backgroundColor: cor }}
        />
      ))}
    </div>
  );
}

export function BandeirinhaSVG({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Fio */}
      <line x1="0" y1="8" x2="200" y2="8" stroke="#C79A3B" strokeWidth="1.5" />
      {/* Bandeirinhas */}
      {[10, 32, 54, 76, 98, 120, 142, 164, 186].map((x, i) => {
        const colors = ['#C21874', '#6F2DA8', '#007C91', '#D96C2F', '#C79A3B', '#1F5F6B', '#4B1E6D', '#C21874', '#6F2DA8'];
        return (
          <polygon
            key={i}
            points={`${x},8 ${x + 18},8 ${x + 9},28`}
            fill={colors[i % colors.length]}
            opacity="0.9"
          />
        );
      })}
    </svg>
  );
}
