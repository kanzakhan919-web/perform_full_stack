'use client';

import { useCrud } from '@/lib/useCrud';
import { useFilters } from '@/lib/useFilters';
import RecordForm from '@/components/RecordForm';
import FilterBar from '@/components/FilterBar';
import { DataTable, LoadState, PageHeader, Pill, RowActions } from '@/components/ui';

export default function FeedbackPage() {
  const { rows, error, loading, form, openNew, openEdit, closeForm, onSaved, remove } = useCrud('feedback');
  const { filtered, filterBar } = useFilters(rows, {
    placeholder: 'Search employee, category or comments…',
    search: ['employee', 'category', 'comments'],
    selects: [
      { key: 'employee_department', label: 'All departments' },
      { key: 'employee', label: 'All employees' },
      { key: 'category', label: 'All categories' },
    ],
  });

  return (
    <>
      {form && <RecordForm key={form.id ?? 'new'} table="feedback" {...form} onClose={closeForm} onSaved={onSaved} />}
      <PageHeader
        title="Employee feedback"
        subtitle="Document coaching and 360-degree feedback"
        addLabel="+ Record feedback"
        onAdd={openNew}
      />
      <LoadState loading={loading} error={error} />
      {rows && (
        <>
          <FilterBar {...filterBar} />
          <div className="card">
            <DataTable
              headers={['EMPLOYEE', 'DEPARTMENT', 'CATEGORY', 'COMMENTS', 'DATE', 'ACTIONS']}
              emptyText={rows.length ? 'No feedback matches the filters' : 'No feedback recorded yet'}
            >
              {filtered.map((x) => (
                <tr key={x.id}>
                  <td>
                    <b>{x.employee}</b>
                  </td>
                  <td>{x.employee_department}</td>
                  <td>{x.category && <Pill>{x.category}</Pill>}</td>
                  <td className="wrap">{x.comments}</td>
                  <td>{x.created_at}</td>
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
