'use client';

import { useCrud } from '@/lib/useCrud';
import { PROGRESS_OPTIONS, useFilters } from '@/lib/useFilters';
import RecordForm from '@/components/RecordForm';
import FilterBar from '@/components/FilterBar';
import { DataTable, LoadState, PageHeader, ProgressBar, RowActions, progressColor } from '@/components/ui';

export default function KpisPage() {
  const { rows, error, loading, form, openNew, openEdit, closeForm, onSaved, remove } = useCrud('kpis');
  const { filtered, filterBar } = useFilters(rows, {
    placeholder: 'Search KPI…',
    search: ['title', 'target', 'actual', 'owner'],
    selects: [
      { key: 'department', label: 'All departments' },
      { key: 'owner', label: 'All owners' },
      { key: 'progress', label: 'Any progress', options: PROGRESS_OPTIONS },
    ],
  });

  return (
    <>
      {form && <RecordForm key={form.id ?? 'new'} table="kpis" {...form} onClose={closeForm} onSaved={onSaved} />}
      <PageHeader
        title="Key performance indicators"
        subtitle="Measurable targets linked to KRAs and employees"
        addLabel="+ Add KPI"
        onAdd={openNew}
      />
      <LoadState loading={loading} error={error} />
      {rows && (
        <>
          <FilterBar {...filterBar} />
          <div className="card">
            <DataTable
              headers={['KPI', 'DEPARTMENT', 'TARGET', 'ACTUAL', 'PROGRESS', 'WEIGHT', 'OWNER', 'ACTIONS']}
              emptyText="No KPIs match the filters"
            >
              {filtered.map((x) => (
                <tr key={x.id}>
                  <td>
                    <b>{x.title}</b>
                  </td>
                  <td>{x.department}</td>
                  <td>{x.target}</td>
                  <td>{x.actual}</td>
                  <td className="progress-cell">
                    {x.progress}% <ProgressBar value={x.progress} color={progressColor(x.progress)} />
                  </td>
                  <td>{x.weight}%</td>
                  <td>{x.owner || 'Unassigned'}</td>
                  <td>
                    <RowActions onEdit={() => openEdit(x)} onDelete={() => remove(x.id)} />
                  </td>
                </tr>
              ))}
            </DataTable>
          </div>
        </>
      )}
    </>
  );
}
