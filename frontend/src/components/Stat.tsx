import type { ReactNode } from 'react';

export function Stat({
  icon,
  label,
  value,
  tone = 'green',
}: {
  icon: ReactNode;
  label: string;
  value: number | string;
  tone?: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}
