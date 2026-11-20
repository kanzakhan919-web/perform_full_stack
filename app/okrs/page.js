'use client';

import { useCrud } from '@/lib/useCrud';
import { PROGRESS_OPTIONS, useFilters } from '@/lib/useFilters';
import RecordForm from '@/components/RecordForm';
import FilterBar from '@/components/FilterBar';
import { LoadState, PageHeader, Pill, ProgressBar, RowActions, progressColor } from '@/components/ui';

export default function OkrsPage() {
  const { rows, error, loading, form, openNew, openEdit, closeForm, onSaved, remove } = useCrud('okrs');
  const { filtered, filterBar } = useFilters(rows, {
    placeholder: 'Search objective or key result…',
    search: ['objective', 'key_result', 'owner'],
    selects: [
      { key: 'department', label: 'All departments' },
      { key: 'owner', label: 'All owners' },
      { key: 'progress', label: 'Any progress', options: PROGRESS_OPTIONS },
    ],
  });

  return (
    <>
      {form && <RecordForm key={form.id ?? 'new'} table="okrs" {...form} onClose={closeForm} onSaved={onSaved} />}
      <PageHeader
        title="Objectives & key results"
        subtitle="Department objectives with measurable key results"
        addLabel="+ Add objective"
        onAdd={openNew}
      />
      <LoadState loading={loading} error={error} />
      {rows && (
        <>
          <FilterBar {...filterBar} />
          {filtered.length === 0 && <div className="card empty">No objectives match the filters</div>}
          <div className="two" style={{ marginTop: 0 }}>
            {filtered.map((x) => (
              <div className="card" key={x.id}>
                <Pill>{x.department}</Pill>
                <h3>{x.objective}</h3>
                <p>
                  <b>Key result</b>
                  <br />
                  <span className="muted">{x.key_result}</span>
                </p>
                <div className="row" style={{ marginBottom: 6 }}>
                  <span className="muted">Progress</span>
                  <b>{x.progress}%</b>
                </div>
                <ProgressBar value={x.progress} color={progressColor(x.progress)} />
                <p className="muted">Owner: {x.owner || 'Unassigned'}</p>
                <RowActions onEdit={() => openEdit(x)} onDelete={() => remove(x.id)} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
