export const ProgressRing = ({ value, max = 100, size = 120, stroke = 8, label, sublabel, color }) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(1, value / max);
  const offset = circumference * (1 - pct);

  let ringColor = color;
  if (!ringColor) {
    if (value <= 40) ringColor = '#ef4444';
    else if (value <= 70) ringColor = '#f59e0b';
    else ringColor = '#10b981';
  }

  return (
    <div className="relative inline-flex items-center justify-center" data-testid="progress-ring">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={ringColor} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="font-mono text-2xl font-semibold tracking-tight" style={{ color: ringColor }}>{label ?? value}</div>
        {sublabel && <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
};
