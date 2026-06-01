import { COMPANIES } from '../lib/mockData';

export const CompanyBadge = ({ companyId, size = 'md' }) => {
  const c = COMPANIES.find(x => x.id === companyId) || COMPANIES[0];
  const sizes = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  };
  return (
    <div
      data-testid={`company-badge-${companyId}`}
      className={`${sizes[size]} rounded-md flex items-center justify-center font-mono font-bold tracking-tighter`}
      style={{ backgroundColor: c.color + '22', color: c.color, border: `1px solid ${c.color}44` }}
    >
      {c.initials}
    </div>
  );
};
