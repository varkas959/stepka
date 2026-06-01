import { HEATMAP_DATA } from '../lib/mockData';

const COLORS = ['rgba(255,255,255,0.04)', '#0f3b2a', '#10b98155', '#10b98199', '#10b981'];

export const ContributionHeatmap = () => {
  // 8 weeks × 7 days grid, oldest -> newest, columns are weeks
  const days = HEATMAP_DATA;
  const weeks = [];
  for (let w = 0; w < 8; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) col.push(days[w * 7 + d]);
    weeks.push(col);
  }
  return (
    <div data-testid="contribution-heatmap" className="flex gap-1.5">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1.5">
          {week.map((v, di) => (
            <div
              key={di}
              title={`Day ${wi * 7 + di + 1}: ${v} card${v === 1 ? '' : 's'}`}
              className="w-3.5 h-3.5 rounded-[3px] border border-white/5 hover:scale-110 transition-transform"
              style={{ background: COLORS[v] }}
            />
          ))}
        </div>
      ))}
      <div className="ml-3 flex flex-col justify-end gap-1.5">
        <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Less</div>
        <div className="flex gap-1">
          {COLORS.map((c, i) => <div key={i} className="w-3 h-3 rounded-[3px]" style={{ background: c }} />)}
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">More</div>
      </div>
    </div>
  );
};
