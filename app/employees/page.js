'use client';

import { useCrud } from '@/lib/useCrud';
import { useFilters } from '@/lib/useFilters';
import RecordForm from '@/components/RecordForm';
import FilterBar from '@/components/FilterBar';
import { DataTable, LoadState, PageHeader, Pill, RowActions } from '@/components/ui';

export default function EmployeesPage() {
  const { rows, error, loading, form, openNew, openEdit, closeForm, onSaved, remove } = useCrud('employees');
  const { filtered, filterBar } = useFilters(rows, {
    placeholder: 'Search name, code, email, designation…',
    search: ['name', 'code', 'email', 'designation', 'manager'],
    selects: [
      { key: 'department', label: 'All departments' },
      { key: 'designation', label: 'All designations' },
      { key: 'manager', label: 'All managers' },
    ],
  });

  return (
    <>
      {form && <RecordForm key={form.id ?? 'new'} table="employees" {...form} onClose={closeForm} onSaved={onSaved} />}
      <PageHeader
        title="Employee records"
        subtitle="Create, update and remove employee profiles"
        addLabel="+ Add employee"
        onAdd={openNew}
      />
      <LoadState loading={loading} error={error} />
      {rows && (
        <>
          <FilterBar {...filterBar} />
          <div className="card">
            <DataTable
              headers={['CODE', 'EMPLOYEE', 'DEPARTMENT', 'DESIGNATION', 'MANAGER', 'EMAIL', 'ACTIONS']}
              emptyText="No employees match the filters"
            >
              {filtered.map((x) => (
                <tr key={x.id}>
                  <td>
                    <Pill color="gray">{x.code}</Pill>
                  </td>
                  <td>
                    <b>{x.name}</b>
                  </td>
                  <td>{x.department}</td>
                  <td>{x.designation}</td>
                  <td>{x.manager}</td>
                  <td>{x.email}</td>
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
