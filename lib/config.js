// Sidebar menu: one entry per page.
export const NAV = [
  { href: '/', icon: '▦', label: 'Dashboard', title: 'Performance Overview' },
  { href: '/employees', icon: '♙', label: 'Employees', title: 'Employee Directory' },
  { href: '/departments', icon: '▤', label: 'Departments', title: 'Department Performance' },
  { href: '/job-descriptions', icon: '▣', label: 'Job Descriptions', title: 'Job Descriptions' },
  { href: '/kras', icon: '◎', label: 'KRAs', title: 'Key Result Areas' },
  { href: '/kpis', icon: '◈', label: 'KPIs', title: 'Key Performance Indicators' },
  { href: '/okrs', icon: '⚑', label: 'OKRs', title: 'Objectives & Key Results' },
  { href: '/appraisals', icon: '★', label: 'Appraisals', title: 'Performance Appraisal' },
  { href: '/feedback', icon: '♧', label: 'Feedback', title: 'Employee Feedback' },
  { href: '/training', icon: '⌁', label: 'Training', title: 'Learning & Development' },
];

export const DEPARTMENTS = ['Human Resources', 'Sales & Marketing'];
export const TRAINING_STATUSES = ['Planned', 'In Progress', 'Completed', 'Recommended'];

// Form fields for each backend table: [field name, label, input type].
// Special types: dept, employee, kra, status (rendered as dropdowns).
export const SCHEMAS = {
  employees: {
    singular: 'Employee',
    fields: [
      ['code', 'Employee code', 'text'],
      ['name', 'Full name', 'text'],
      ['department', 'Department', 'dept'],
      ['designation', 'Designation', 'text'],
      ['manager', 'Reporting manager', 'text'],
      ['email', 'Email', 'email'],
    ],
  },
  job_descriptions: {
    singular: 'Job Description',
    fields: [
      ['title', 'Job title', 'text'],
      ['department', 'Department', 'dept'],
      ['reports_to', 'Reports to', 'text'],
      ['education', 'Education', 'text'],
      ['experience', 'Experience', 'text'],
      ['responsibilities', 'Key responsibilities', 'textarea'],
      ['skills', 'Required skills', 'textarea'],
    ],
  },
  kras: {
    singular: 'KRA',
    fields: [
      ['title', 'KRA title', 'text'],
      ['department', 'Department', 'dept'],
      ['description', 'Description', 'textarea'],
      ['owner_id', 'Owner', 'employee'],
    ],
  },
  kpis: {
    singular: 'KPI',
    fields: [
      ['title', 'KPI title', 'text'],
      ['department', 'Department', 'dept'],
      ['target', 'Target', 'text'],
      ['actual', 'Actual', 'text'],
      ['progress', 'Progress %', 'number'],
      ['weight', 'Weight %', 'number'],
      ['owner_id', 'Owner', 'employee'],
      ['kra_id', 'Linked KRA', 'kra'],
    ],
  },
  okrs: {
    singular: 'Objective',
    fields: [
      ['objective', 'Objective', 'text'],
      ['key_result', 'Key result', 'text'],
      ['department', 'Department', 'dept'],
      ['progress', 'Progress %', 'number'],
      ['owner_id', 'Owner', 'employee'],
    ],
  },
  appraisals: {
    singular: 'Appraisal',
    fields: [
      ['employee_id', 'Employee', 'employee'],
      ['period', 'Appraisal period', 'text'],
      ['kpi_score', 'KPI score (0–100)', 'number'],
      ['competency_score', 'Competency score (0–100)', 'number'],
      ['goal_score', 'Goal score (0–100)', 'number'],
      ['comments', 'Manager comments', 'textarea'],
    ],
  },
  feedback: {
    singular: 'Feedback',
    fields: [
      ['employee_id', 'Employee', 'employee'],
      ['category', 'Feedback category', 'text'],
      ['comments', 'Feedback comments', 'textarea'],
    ],
  },
  training: {
    singular: 'Training',
    fields: [
      ['title', 'Training title', 'text'],
      ['audience', 'Target audience', 'text'],
      ['status', 'Status', 'status'],
      ['notes', 'Notes', 'textarea'],
    ],
  },
};
