'use client';

import { useState } from 'react';

// Ready-made filter options for progress percentages (KPIs, OKRs).
export const PROGRESS_OPTIONS = [
  { label: 'Achieved (100%+)', test: (r) => r.progress >= 100 },
  { label: 'On track (80–99%)', test: (r) => r.progress >= 80 && r.progress < 100 },
  { label: 'Behind (below 80%)', test: (r) => r.progress < 80 },
];

// Client-side filtering for a list page.
//
// config = {
//   search: ['name', 'code'],                            fields matched by the search box
//   selects: [
//     { key: 'department', label: 'All departments' },   options = distinct values of row.department
//     { key: 'owner', label: 'All owners', field: 'owner' },
//     { key: 'progress', label: 'Any progress', options: PROGRESS_OPTIONS },  custom tests
//   ],
// }
//
// Returns { filtered, filterBar } — pass filterBar to <FilterBar {...filterBar} />.
export function useFilters(rows, config) {
  const [values, setValues] = useState({});
  const list = rows || [];

  const selects = (config.selects || []).map((s) => {
    const field = s.field || s.key;
    const options = s.options
      ? s.options.map((o) => ({ ...o, value: o.label }))
      : [...new Set(list.map((r) => r[field]).filter((v) => v !== null && v !== undefined && v !== ''))]
          .map(String)
          .sort((a, b) => a.localeCompare(b))
          .map((v) => ({ label: v, value: v }));
    return { ...s, field, options };
  });

  const q = (values.q || '').trim().toLowerCase();
  const filtered = list.filter((r) => {
    if (q && !(config.search || []).some((f) => String(r[f] ?? '').toLowerCase().includes(q))) return false;
    for (const s of selects) {
      const v = values[s.key];
      if (!v) continue;
      const opt = s.options.find((o) => o.value === v);
      if (opt?.test ? !opt.test(r) : String(r[s.field] ?? '') !== v) return false;
    }
    return true;
  });

  const active = Object.values(values).some(Boolean);

  return {
    filtered: rows ? filtered : rows,
    filterBar: {
      selects,
      values,
      placeholder: config.placeholder || 'Search…',
      hasSearch: !!config.search?.length,
      setValue: (key, value) => setValues((v) => ({ ...v, [key]: value })),
      clear: () => setValues({}),
      active,
      shown: filtered.length,
      total: list.length,
    },
  };
}
