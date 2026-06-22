import { useState, useMemo } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

// Searchable combobox-style filter chip used in the Question Bank filter row.
// Renders a trigger button and a typeahead-filtered list in a popover.
export const SearchableFilterChip = ({
  label,
  value,         // selected id or null
  options,       // [{id, label, group?}]
  onChange,
  onClear,
  testid,
  emptyText = 'No matches',
}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const active = !!value;
  const selected = options.find(o => o.id === value);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return options;
    return options.filter(o => o.label.toLowerCase().includes(needle) || (o.group || '').toLowerCase().includes(needle));
  }, [options, q]);

  const grouped = useMemo(() => {
    if (!filtered.some(o => o.group)) return null;
    return filtered.reduce((acc, o) => { (acc[o.group || 'Other'] ||= []).push(o); return acc; }, {});
  }, [filtered]);

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQ(''); }}>
      <PopoverTrigger asChild>
        <button
          data-testid={`filter-chip-${testid}`}
          className={`group inline-flex items-center gap-1 font-mono text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
            active
              ? 'border-emerald-500/40 bg-emerald-500/[0.06] text-emerald-400'
              : 'border-white/10 bg-transparent text-zinc-500 hover:border-white/25 hover:text-zinc-300'
          }`}
        >
          {!active && <span className="opacity-80">+</span>}
          <span className={active ? '' : 'lowercase'}>{active ? selected?.label : label}</span>
          {active ? (
            <span role="button" tabIndex={0}
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onClear(); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); e.preventDefault(); onClear(); } }}
              className="ml-0.5 -mr-0.5 p-0.5 rounded hover:bg-emerald-500/15 cursor-pointer"
              data-testid={`chip-clear-${testid}`} aria-label={`Remove ${label}`}>
              <X size={12} strokeWidth={2.5} />
            </span>
          ) : <ChevronDown size={12} className="text-zinc-600" />}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[260px] p-0 bg-zinc-950 border border-white/10 text-zinc-50 shadow-xl">
        <div className="border-b border-white/5 p-2 flex items-center gap-2">
          <Search size={12} className="text-zinc-500 ml-1" />
          <input
            autoFocus
            data-testid={`filter-search-${testid}`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={`type to filter ${label}…`}
            className="flex-1 bg-transparent border-0 outline-none font-mono text-xs text-zinc-100 placeholder:text-zinc-600"
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto py-1">
          {filtered.length === 0 && (
            <div className="px-3 py-6 text-center font-mono text-xs text-zinc-600">{emptyText}</div>
          )}
          {!grouped && filtered.map(o => (
            <Row key={o.id} option={o} selected={value === o.id}
              onSelect={() => { onChange(o.id); setOpen(false); setQ(''); }}
              testid={`filter-option-${testid}-${o.id}`} />
          ))}
          {grouped && Object.entries(grouped).map(([g, items]) => (
            <div key={g}>
              <div className="px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-zinc-600 font-mono">{g}</div>
              {items.map(o => (
                <Row key={o.id} option={o} selected={value === o.id}
                  onSelect={() => { onChange(o.id); setOpen(false); setQ(''); }}
                  testid={`filter-option-${testid}-${o.id}`} />
              ))}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const Row = ({ option, selected, onSelect, testid }) => (
  <button
    data-testid={testid}
    onClick={onSelect}
    className={`w-full flex items-center gap-2 px-3 py-1.5 font-mono text-sm text-left transition-colors ${
      selected ? 'bg-emerald-500/[0.08] text-emerald-400' : 'text-zinc-300 hover:bg-white/5'
    }`}>
    <span className="flex-1">{option.label}</span>
    {selected && <Check size={13} className="text-emerald-400" />}
  </button>
);
