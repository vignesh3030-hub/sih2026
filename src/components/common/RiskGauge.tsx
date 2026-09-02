import React from 'react';

interface RiskGaugeProps {
  score: number; // 0 to 100
  size?: number;
  label?: string;
  sublabel?: string;
  showNeedle?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  size = 180,
  label = 'AI Risk Index',
  sublabel,
  showNeedle = true,
}) => {
  const safeScore = Math.min(100, Math.max(0, Math.round(score || 0)));
  
  // Calculate risk status and colors
  let color = '#10B981'; // Green
  let statusText = 'Low Risk';
  let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (safeScore >= 80) {
    color = '#E11D48'; // Rose/Red
    statusText = 'Critical Risk';
    badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (safeScore >= 60) {
    color = '#F59E0B'; // Orange/Amber
    statusText = 'High Risk';
    badgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
  } else if (safeScore >= 35) {
    color = '#EAB308'; // Yellow
    statusText = 'Medium Risk';
    badgeBg = 'bg-amber-50 text-amber-700 border-amber-300/60';
  }

  // Semi-circle arc calculations
  const strokeWidth = 14;
  const radius = (size - strokeWidth * 2) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10;
  
  // Angle: -180 deg (left) to 0 deg (right)
  const angle = -180 + (safeScore / 100) * 180;
  const needleLen = radius - 8;
  const needleRad = (angle * Math.PI) / 180;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  return (
    <div className="flex flex-col items-center justify-center relative select-none">
      <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="35%" stopColor="#EAB308" />
            <stop offset="65%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#E11D48" />
          </linearGradient>
        </defs>

        {/* Background Track Arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Dynamic Colored Arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${(safeScore / 100) * (Math.PI * radius)} ${Math.PI * radius}`}
          className="transition-all duration-700 ease-out"
        />

        {/* Center Pivot */}
        <circle cx={cx} cy={cy} r={6} fill="#1E293B" />

        {/* Needle */}
        {showNeedle && (
          <line
            x1={cx}
            y1={cy}
            x2={nx}
            y2={ny}
            stroke="#1E293B"
            strokeWidth={3}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        )}
      </svg>

      {/* Numerical score overlay */}
      <div className="text-center -mt-2">
        <div className="flex items-baseline justify-center gap-0.5">
          <span className="text-3xl font-bold tracking-tight text-slate-900 font-mono">{safeScore}</span>
          <span className="text-xs font-semibold text-slate-500">/100</span>
        </div>
        <div className="mt-1">
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeBg}`}>
            {statusText}
          </span>
        </div>
        {label && <p className="text-xs font-medium text-slate-500 mt-1.5">{label}</p>}
        {sublabel && <p className="text-[11px] text-slate-400">{sublabel}</p>}
      </div>
    </div>
  );
};
