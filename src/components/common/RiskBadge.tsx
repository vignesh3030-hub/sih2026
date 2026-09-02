import React from 'react';
import { RiskLevel } from '../../types';
import { ShieldAlert, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md', showIcon = true }) => {
  const normalized = (level || 'LOW').toUpperCase();

  let colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dotColor = 'bg-emerald-500';
  let Icon = CheckCircle2;
  let label = 'Low Risk';

  if (normalized === 'CRITICAL' || normalized === 'CRITICAL DELAYED') {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-600';
    Icon = ShieldAlert;
    label = 'Critical';
  } else if (normalized === 'HIGH' || normalized === 'AT RISK') {
    colorClasses = 'bg-amber-50 text-amber-800 border-amber-200';
    dotColor = 'bg-amber-500';
    Icon = AlertTriangle;
    label = 'High Risk';
  } else if (normalized === 'MEDIUM' || normalized === 'MODERATE') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-300/60';
    dotColor = 'bg-amber-400';
    Icon = AlertCircle;
    label = 'Medium Risk';
  } else {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
    Icon = CheckCircle2;
    label = 'Low Risk';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3 py-1.5 font-semibold',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${colorClasses} ${sizeClasses} whitespace-nowrap shadow-2xs`}>
      <span className={`w-2 h-2 rounded-full ${dotColor} shrink-0 animate-pulse`} />
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{label}</span>
    </span>
  );
};
