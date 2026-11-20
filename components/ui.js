// Small presentational components shared by all pages.

// Colour used for each appraisal rating (pills and bars).
export const RATING_COLORS = {
  Excellent: 'green',
  'Very Good': 'blue',
  Good: 'gray',
  'Needs Improvement': 'orange',
  Unsatisfactory: 'red',
};

// Colour for a progress / score percentage.
export const progressColor = (v) => (v >= 100 ? 'green' : v >= 80 ? '' : v >= 60 ? 'orange' : 'red');

export function ProgressBar({ value, max = 100, color = '' }) {
  const width = Math.min(100, Math.max(0, ((Number(value) || 0) / max) * 100));
  return (
    <div className={'bar ' + color}>
      <i style={{ width: width + '%' }} />
    </div>
  );
}

// One labelled bar: "Label  [=====    ]  value"
export function BarRow({ label, value, display, max = 100, color }) {
  return (
    <div className="barrow">
      <span>{label}</span>
      <ProgressBar value={value} max={max} color={color} />
      <span className="value">{display ?? value}</span>
    </div>
  );
}

export function MetricCard({ label, value, note, color = '' }) {
  return (
    <div className={'metric-card ' + color}>
      <div className="metric-label">{label}</div>
      <div className="metric">{value}</div>
      {note && <div className="metric-note">{note}</div>}
    </div>
  );
}

export function Pill({ children, color = '' }) {
  return <span className={'pill ' + color}>{children}</span>;
}

export function PageHeader({ title, subtitle, addLabel, onAdd }) {
  return (
    <div className="row">
      <div>
        <b>{title}</b>
        <div className="muted">{subtitle}</div>
      </div>
      {addLabel && (
        <button className="btn" onClick={onAdd}>
          {addLabel}
        </button>
      )}
    </div>
  );
}

export function DataTable({ headers, children, emptyText = 'No records found' }) {
  const hasRows = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hasRows ? (
            children
          ) : (
            <tr>
              <td colSpan={headers.length} className="empty">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function RowActions({ onEdit, onDelete }) {
  return (
    <div className="actions">
      {onEdit && (
        <button className="btn alt sm" onClick={onEdit}>
          Edit
        </button>
      )}
      {onDelete && (
        <button className="btn danger sm" onClick={onDelete}>
          Delete
        </button>
      )}
    </div>
  );
}

// Shows "Loading…" or an error box. Returns null when data is ready.
export function LoadState({ loading, error }) {
  if (error) return <div className="notice error">Could not load data: {error}</div>;
  if (loading) return <div className="empty">Loading…</div>;
  return null;
}
