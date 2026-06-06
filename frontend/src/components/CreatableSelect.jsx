import { useState, useMemo, useRef, useEffect } from 'react';
import { Check, ChevronDown, Plus, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

// Combobox-style input that lets users pick from suggestions OR type a custom value.
// Used in Add-Question form.
export const CreatableSelect = ({
  label,
  value,
  onChange,
  options = [],       // [{id, label}]
  placeholder = 'select or type…',
  testid,
}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const inputRef = useRef(null);

  const display = value || '';
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return options;
    return options.filter(o => o.label.toLowerCase().includes(needle));
  }, [options, q]);

  const exists = filtered.some(o => o.id.toLowerCase() === q.trim().toLowerCase() || o.label.toLowerCase() === q.trim().toLowerCase());

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30);
  }, [open]);

  const commit = (val) => {
    onChange(val);
    setOpen(false);
    setQ('');
  };

  return (
    <label className="block">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500 mb-1.5">{label}</div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button type="button" data-testid={`creatable-${testid}`}
            className="w-full inline-flex items-center justify-between gap-2 bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-left text-sm font-mono text-zinc-100 hover:border-white/20 focus:outline-none focus:border-white/30">
            <span className={display ? '' : 'text-zinc-600'}>{display || placeholder}</span>
            <ChevronDown size={13} className="text-zinc-500" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0 bg-zinc-950 border border-white/10 text-zinc-50 shadow-xl">
          <div className="p-2 border-b border-white/5 flex items-center gap-2">
            <input
              ref={inputRef}
              data-testid={`creatable-search-${testid}`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && q.trim()) { e.preventDefault(); commit(q.trim()); }
              }}
              placeholder={`type ${label}…`}
              className="flex-1 bg-transparent border-0 outline-none font-mono text-xs text-zinc-100 placeholder:text-zinc-600 px-1"
            />
            {q && (
              <button type="button" onClick={() => setQ('')} className="text-zinc-500 hover:text-zinc-100 p-0.5"><X size={11} /></button>
            )}
          </div>
          <div className="max-h-[260px] overflow-y-auto py-1">
            {filtered.map(o => (
              <button key={o.id} type="button" data-testid={`creatable-option-${testid}-${o.id}`}
                onClick={() => commit(o.id)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 font-mono text-sm text-left transition-colors ${
                  value === o.id ? 'bg-emerald-500/[0.08] text-emerald-400' : 'text-zinc-300 hover:bg-white/5'
                }`}>
                <span className="flex-1">{o.label}</span>
                {value === o.id && <Check size={12} className="text-emerald-400" />}
              </button>
            ))}
            {q.trim() && !exists && (
              <button type="button" data-testid={`creatable-add-${testid}`}
                onClick={() => commit(q.trim())}
                className="w-full flex items-center gap-2 px-3 py-2 font-mono text-sm text-left text-amber-400 hover:bg-amber-500/[0.06] border-t border-white/5">
                <Plus size={12} /> <span>add custom: "{q.trim()}"</span>
              </button>
            )}
            {filtered.length === 0 && !q.trim() && (
              <div className="px-3 py-4 text-center font-mono text-xs text-zinc-600">type to search or create</div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </label>
  );
};
