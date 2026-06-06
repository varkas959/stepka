// Pixelated/8-bit style progress bar (filled blocks + dotted empty).
export const PixelBar = ({ value, max = 100, width = 130, height = 14, color = '#22c55e', dotColor }) => {
  const pct = Math.max(0, Math.min(1, value / max));
  const dot = dotColor || color;
  return (
    <div className="inline-block relative align-middle" style={{ width, height }} data-testid="pixel-bar">
      {/* dotted empty background */}
      <div
        className="absolute inset-0 rounded-[2px]"
        style={{
          backgroundImage: `radial-gradient(${dot}55 1.1px, transparent 1.2px)`,
          backgroundSize: '4px 4px',
          backgroundPosition: '0 0',
          opacity: 0.85,
        }}
      />
      {/* filled solid */}
      <div
        className="absolute inset-y-0 left-0 rounded-[2px]"
        style={{
          width: `${pct * 100}%`,
          background: color,
          boxShadow: `inset 0 0 0 1px ${color}, 0 0 10px ${color}55`,
        }}
      />
    </div>
  );
};
