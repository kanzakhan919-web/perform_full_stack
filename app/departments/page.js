'use client';

import { useResource } from '@/lib/useResource';
import { LoadState, MetricCard, ProgressBar, progressColor } from '@/components/ui';

export default function DepartmentsPage() {
  const { data, error, loading } = useResource('dashboard');

  return (
    <>
      <LoadState loading={loading} error={error} />
      {data && (
        <>
          <div className="grid">
            <MetricCard label="Departments" value={data.byDept.length} />
            <MetricCard label="Employees" value={data.employees} color="green" />
            <MetricCard label="Average final score" value={data.avg + '%'} color="green" />
            <MetricCard label="Average KPI progress" value={data.kpi + '%'} color="orange" />
          </div>
          <div className="two">
            {data.byDept.map((x) => (
              <div className="card dept-card" key={x.department}>
                <span className="pill">Business unit</span>
                <h3>{x.department}</h3>
                <div className="metric">{x.score ?? 0}%</div>
                <div className="muted" style={{ marginBottom: 10 }}>
                  Average appraisal score · {x.employees} employees
                </div>
                <ProgressBar value={x.score} color={progressColor(x.score)} />
              </div>
            ))}
          </div>
          <div className="notice">
            Department results are calculated from employee appraisal records stored in the database.
          </div>
        </>
      )}
    </>
  );
}
