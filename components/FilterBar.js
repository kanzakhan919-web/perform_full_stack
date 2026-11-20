'use client';

// Search box + dropdown filters + "Showing X of Y". Props come from useFilters().filterBar.
export default function FilterBar({ selects, values, placeholder, hasSearch, setValue, clear, active, shown, total }) {
  return (
    <div className="filters">
      {hasSearch && (
        <div className="search">
          <input
            type="search"
            placeholder={placeholder}
            value={values.q || ''}
            onChange={(e) => setValue('q', e.target.value)}
            aria-label="Search"
          />
        </div>
      )}
      {selects.map((s) => (
        <select key={s.key} value={values[s.key] || ''} onChange={(e) => setValue(s.key, e.target.value)} aria-label={s.label}>
          <option value="">{s.label}</option>
          {s.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
      {active && (
        <button className="btn alt sm" type="button" onClick={clear}>
          ✕ Clear
        </button>
      )}
      <span className="count">
        Showing <b>{shown}</b> of {total}
      </span>
    </div>
  );
}
