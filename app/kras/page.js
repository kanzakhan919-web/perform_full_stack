'use client';

import { useCrud } from '@/lib/useCrud';
import { useFilters } from '@/lib/useFilters';
import RecordForm from '@/components/RecordForm';
import FilterBar from '@/components/FilterBar';
import { DataTable, LoadState, PageHeader, RowActions } from '@/components/ui';

export default function KrasPage() {
  const { rows, error, loading, form, openNew, openEdit, closeForm, onSaved, remove } = useCrud('kras');
  const { filtered, filterBar } = useFilters(rows, {
    placeholder: 'Search KRA or description…',
    search: ['title', 'description', 'owner'],
    selects: [
      { key: 'department', label: 'All departments' },
      { key: 'owner', label: 'All owners' },
    ],
  });

  return (
    <>
      {form && <RecordForm key={form.id ?? 'new'} table="kras" {...form} onClose={closeForm} onSaved={onSaved} />}
      <PageHeader
        title="Key responsibility areas"
        subtitle="Broad outcome areas aligned with job descriptions"
        addLabel="+ Add KRA"
        onAdd={openNew}
      />
      <LoadState loading={loading} error={error} />
      {rows && (
        <>
          <FilterBar {...filterBar} />
          <div className="card">
            <DataTable headers={['KRA', 'DEPARTMENT', 'DESCRIPTION', 'OWNER', 'ACTIONS']} emptyText="No KRAs match the filters">
              {filtered.map((x) => (
                <tr key={x.id}>
                  <td>
                    <b>{x.title}</b>
                  </td>
                  <td>{x.department}</td>
                  <td className="wrap">{x.description}</td>
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
