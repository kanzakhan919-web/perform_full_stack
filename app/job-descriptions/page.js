'use client';

import { useCrud } from '@/lib/useCrud';
import { useFilters } from '@/lib/useFilters';
import RecordForm from '@/components/RecordForm';
import FilterBar from '@/components/FilterBar';
import { LoadState, PageHeader, Pill, RowActions } from '@/components/ui';

export default function JobDescriptionsPage() {
  const { rows, error, loading, form, openNew, openEdit, closeForm, onSaved, remove } = useCrud('job_descriptions');
  const { filtered, filterBar } = useFilters(rows, {
    placeholder: 'Search title, skills, responsibilities…',
    search: ['title', 'skills', 'responsibilities', 'education', 'reports_to'],
    selects: [
      { key: 'department', label: 'All departments' },
      { key: 'reports_to', label: 'Any reporting line' },
    ],
  });

  return (
    <>
      {form && (
        <RecordForm key={form.id ?? 'new'} table="job_descriptions" {...form} onClose={closeForm} onSaved={onSaved} />
      )}
      <PageHeader
        title="Job description library"
        subtitle="Role purpose, reporting line, qualifications and responsibilities"
        addLabel="+ Add job description"
        onAdd={openNew}
      />
      <LoadState loading={loading} error={error} />
      {rows && (
        <>
          <FilterBar {...filterBar} />
          {filtered.length === 0 && <div className="card empty">No job descriptions match the filters</div>}
          <div className="two" style={{ marginTop: 0 }}>
            {filtered.map((x) => (
              <div className="card" key={x.id}>
                <Pill>{x.department}</Pill>
                <h3>{x.title}</h3>
                <div className="muted">Reports to: {x.reports_to}</div>
                <p>
                  <b>Responsibilities</b>
                  <br />
                  <span className="muted">{x.responsibilities}</span>
                </p>
                <p>
                  <b>Education & experience</b>
                  <br />
                  <span className="muted">
                    {x.education} · {x.experience}
                  </span>
                </p>
                <p>
                  <b>Skills</b>
                  <br />
                  <span className="muted">{x.skills}</span>
                </p>
                <RowActions onEdit={() => openEdit(x)} onDelete={() => remove(x.id)} />
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
