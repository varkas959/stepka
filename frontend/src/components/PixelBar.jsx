// Pixelated/8-bit style progress bar. Default fills container width.
export const PixelBar = ({ value, max = 100, width, height = 14, color = '#22c55e', dotColor }) => {
  const pct = Math.max(0, Math.min(1, value / max));
  const dot = dotColor || color;
  const widthStyle = width === undefined ? '100%' : (typeof width === 'number' ? `${width}px` : width);
  return (
    <div className="relative block" style={{ width: widthStyle, height, minWidth: 0 }} data-testid="pixel-bar">
      <div
        className="absolute inset-0 rounded-[2px]"
        style={{
          backgroundImage: `radial-gradient(${dot}55 1.1px, transparent 1.2px)`,
          backgroundSize: '4px 4px',
          opacity: 0.85,
        }}
      />
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
