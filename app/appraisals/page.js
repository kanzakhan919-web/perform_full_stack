'use client';

import { useCrud } from '@/lib/useCrud';
import { useFilters } from '@/lib/useFilters';
import RecordForm from '@/components/RecordForm';
import FilterBar from '@/components/FilterBar';
import { DataTable, LoadState, PageHeader, Pill, RATING_COLORS, RowActions } from '@/components/ui';

const RATING_OPTIONS = Object.keys(RATING_COLORS).map((r) => ({ label: r, test: (row) => row.rating === r }));

export default function AppraisalsPage() {
  const { rows, error, loading, form, openNew, openEdit, closeForm, onSaved, remove } = useCrud('appraisals');
  const { filtered, filterBar } = useFilters(rows, {
    placeholder: 'Search employee or comments…',
    search: ['employee', 'comments', 'period'],
    selects: [
      { key: 'employee_department', label: 'All departments' },
      { key: 'employee', label: 'All employees' },
      { key: 'period', label: 'All periods' },
      { key: 'rating', label: 'All ratings', options: RATING_OPTIONS },
    ],
  });

  return (
    <>
      {form && <RecordForm key={form.id ?? 'new'} table="appraisals" {...form} onClose={closeForm} onSaved={onSaved} />}
      <PageHeader
        title="Employee appraisal records"
        subtitle="KPI 50% · Competencies 25% · Goals 25%"
        addLabel="+ New appraisal"
        onAdd={openNew}
      />
      <LoadState loading={loading} error={error} />
      {rows && (
        <>
          <FilterBar {...filterBar} />
          <div className="card">
            <DataTable
              headers={['EMPLOYEE', 'DEPARTMENT', 'PERIOD', 'KPI', 'COMPETENCY', 'GOALS', 'FINAL', 'RATING', 'COMMENTS', 'ACTIONS']}
              emptyText="No appraisals match the filters"
            >
              {filtered.map((x) => (
                <tr key={x.id}>
                  <td>
                    <b>{x.employee}</b>
                  </td>
                  <td>{x.employee_department}</td>
                  <td>{x.period}</td>
                  <td>{x.kpi_score}</td>
                  <td>{x.competency_score}</td>
                  <td>{x.goal_score}</td>
                  <td>
                    <b>{x.final_score}%</b>
                  </td>
                  <td>
                    <Pill color={RATING_COLORS[x.rating]}>{x.rating}</Pill>
                  </td>
                  <td className="wrap">{x.comments}</td>
                  <td>
                    <RowActions onEdit={() => openEdit(x)} onDelete={() => remove(x.id)} />
                  </td>
                </tr>
              ))}
            </DataTable>
          </div>
        </>
      )}
      <div className="notice">
        Final score = (KPI × 50%) + (Competency × 25%) + (Goals × 25%). Rating bands: Excellent 90+, Very Good
        80–89, Good 70–79, Needs Improvement 60–69, Unsatisfactory below 60.
      </div>
    </>
  );
}
