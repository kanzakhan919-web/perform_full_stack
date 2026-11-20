'use client';

import { useCrud } from '@/lib/useCrud';
import { useFilters } from '@/lib/useFilters';
import RecordForm from '@/components/RecordForm';
import FilterBar from '@/components/FilterBar';
import { DataTable, LoadState, PageHeader, Pill, RowActions } from '@/components/ui';

const STATUS_COLORS = { Planned: 'gray', 'In Progress': 'blue', Completed: 'green', Recommended: 'orange' };

export default function TrainingPage() {
  const { rows, error, loading, form, openNew, openEdit, closeForm, onSaved, remove } = useCrud('training');
  const { filtered, filterBar } = useFilters(rows, {
    placeholder: 'Search program or notes…',
    search: ['title', 'audience', 'notes'],
    selects: [
      { key: 'status', label: 'All statuses' },
      { key: 'audience', label: 'All audiences' },
    ],
  });

  return (
    <>
      {form && <RecordForm key={form.id ?? 'new'} table="training" {...form} onClose={closeForm} onSaved={onSaved} />}
      <PageHeader
        title="Learning & development plans"
        subtitle="Training actions to close performance gaps"
        addLabel="+ Add training"
        onAdd={openNew}
      />
      <LoadState loading={loading} error={error} />
      {rows && (
        <>
          <FilterBar {...filterBar} />
          <div className="card">
            <DataTable headers={['PROGRAM', 'AUDIENCE', 'STATUS', 'NOTES', 'ACTIONS']} emptyText="No training matches the filters">
              {filtered.map((x) => (
                <tr key={x.id}>
                  <td>
                    <b>{x.title}</b>
                  </td>
                  <td>{x.audience}</td>
                  <td>
                    <Pill color={STATUS_COLORS[x.status]}>{x.status}</Pill>
                  </td>
                  <td className="wrap">{x.notes}</td>
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
