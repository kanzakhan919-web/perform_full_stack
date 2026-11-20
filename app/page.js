'use client';

import { useState } from 'react';
import { useResource } from '@/lib/useResource';
import { BarRow, LoadState, MetricCard, Pill, RATING_COLORS, progressColor } from '@/components/ui';

const RATINGS = Object.keys(RATING_COLORS);
const avg = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : null);

export default function DashboardPage() {
  const employees = useResource('employees');
  const appraisals = useResource('appraisals');
  const kpis = useResource('kpis');
  const [dept, setDept] = useState('');
  const [period, setPeriod] = useState('');

  const error = employees.error || appraisals.error || kpis.error;
  if (error || !employees.data || !appraisals.data || !kpis.data) return <LoadState error={error} loading />;

  // ---- Filter options
  const departments = [...new Set(employees.data.map((e) => e.department))].sort();
  const periods = [...new Set(appraisals.data.map((a) => a.period).filter(Boolean))].sort();

  // ---- Apply filters
  const emps = employees.data.filter((e) => !dept || e.department === dept);
  const apps = appraisals.data.filter(
    (a) => (!dept || a.employee_department === dept) && (!period || a.period === period)
  );
  const kpiRows = kpis.data.filter((k) => !dept || k.department === dept);

  // ---- Figures
  const scores = apps.map((a) => a.final_score).filter((s) => typeof s === 'number');
  const avgScore = avg(scores);
  const high = apps.filter((a) => a.rating === 'Excellent' || a.rating === 'Very Good').length;
  const atRisk = apps.filter((a) => a.final_score < 70).length;
  const kpiAvg = avg(kpiRows.map((k) => k.progress).filter((p) => typeof p === 'number'));

  const ratingCounts = RATINGS.map((r) => ({ rating: r, count: apps.filter((a) => a.rating === r).length }));
  const maxRating = Math.max(1, ...ratingCounts.map((r) => r.count));

  const deptScores = departments
    .filter((d) => !dept || d === dept)
    .map((d) => {
      const s = apps.filter((a) => a.employee_department === d).map((a) => a.final_score);
      return { department: d, rated: s.length, score: avg(s) };
    });

  const kpiDepts = [...new Set(kpiRows.map((k) => k.department))].sort();
  const recent = [...apps].sort((a, b) => b.id - a.id).slice(0, 6);
  const filtered = dept || period;

  return (
    <>
      <div className="filters">
        <b style={{ marginRight: 4 }}>Filters</b>
        <select value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department">
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} aria-label="Appraisal period">
          <option value="">All periods</option>
          {periods.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
        {filtered && (
          <button className="btn alt sm" onClick={() => { setDept(''); setPeriod(''); }}>
            ✕ Clear
          </button>
        )}
        <a className="btn alt sm" href="/api/export/employees" style={{ marginLeft: 'auto' }}>
          ⬇ Export CSV
        </a>
      </div>

      <div className="grid five">
        <MetricCard label="Employees" value={emps.length} note={dept || `Across ${departments.length} departments`} />
        <MetricCard
          label="Average final score"
          value={avgScore == null ? '—' : Math.round(avgScore) + '%'}
          note={`${scores.length} appraisal${scores.length === 1 ? '' : 's'}`}
          color="green"
        />
        <MetricCard label="Excellent or Very Good" value={`${high} / ${apps.length}`} note="Appraisals rated 80+" color="green" />
        <MetricCard label="Needs attention (below 70)" value={atRisk} note="Candidates for an improvement plan" color="red" />
        <MetricCard
          label="Average KPI progress"
          value={kpiAvg == null ? '—' : Math.round(kpiAvg) + '%'}
          note={`${kpiRows.length} KPIs`}
          color="orange"
        />
      </div>

      <div className="two">
        <div className="card">
          <div className="cardtitle">Rating distribution</div>
          {ratingCounts.map((r) => (
            <BarRow key={r.rating} label={r.rating} value={r.count} max={maxRating} color={RATING_COLORS[r.rating]} />
          ))}
        </div>

        <div className="card">
          <div className="cardtitle">Department average final score</div>
          {deptScores.map((d) => (
            <BarRow
              key={d.department}
              label={`${d.department} (${d.rated} rated)`}
              value={d.score ?? 0}
              display={d.score == null ? '—' : Math.round(d.score) + '%'}
            />
          ))}
          <div className="cardnote">Bar length = average score out of 100.</div>
        </div>
      </div>

      <div className="two">
        {kpiDepts.map((d) => (
          <div className="card" key={d}>
            <div className="cardtitle">{d}: KPI progress</div>
            {kpiRows
              .filter((k) => k.department === d)
              .map((k) => (
                <BarRow key={k.id} label={k.title} value={k.progress} display={k.progress + '%'} color={progressColor(k.progress)} />
              ))}
          </div>
        ))}
        {kpiDepts.length === 0 && <div className="card empty">No KPIs for this filter</div>}
      </div>

      <div className="two">
        <div className="card">
          <div className="cardtitle">Recent appraisals</div>
          {recent.length === 0 && <div className="empty">No appraisals for this filter</div>}
          {recent.map((a) => (
            <div className="recent-item" key={a.id}>
              <div>
                <b>{a.employee}</b>
                <div className="muted">
                  {a.employee_department} · {a.period}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <b>{a.final_score}%</b> <Pill color={RATING_COLORS[a.rating]}>{a.rating}</Pill>
              </div>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="cardtitle">Scoring guide</div>
          <p className="muted">Final score = KPI × 50% + Competency × 25% + Goals × 25%</p>
          {[
            ['Excellent', '90 and above'],
            ['Very Good', '80 – 89'],
            ['Good', '70 – 79'],
            ['Needs Improvement', '60 – 69'],
            ['Unsatisfactory', 'below 60'],
          ].map(([r, range]) => (
            <div className="recent-item" key={r}>
              <Pill color={RATING_COLORS[r]}>{r}</Pill>
              <span className="muted">{range}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
