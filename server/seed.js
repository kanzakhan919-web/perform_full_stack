// Sample data, added only when the database is empty.
const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ');

export default async function seed(db, nextId) {
  const add = async (collection, doc) => {
    const id = await nextId(collection);
    await db.collection(collection).insertOne({ id, ...doc });
    return id;
  };

  const emp = {};
  for (const [code, name, department, designation, manager, email] of [
    ['E001', 'Ayesha Khan', 'Human Resources', 'HR Manager', 'Director HR', 'ayesha@example.com'],
    ['E002', 'Ali Ahmed', 'Human Resources', 'Talent Acquisition Officer', 'Ayesha Khan', 'ali@example.com'],
    ['E003', 'Sara Malik', 'Human Resources', 'Training Officer', 'Ayesha Khan', 'sara@example.com'],
    ['E004', 'Usman Raza', 'Sales & Marketing', 'Sales Manager', 'Head of Sales', 'usman@example.com'],
    ['E005', 'Hira Shah', 'Sales & Marketing', 'Sales Executive', 'Usman Raza', 'hira@example.com'],
    ['E006', 'Hamza Iqbal', 'Sales & Marketing', 'Marketing Officer', 'Marketing Head', 'hamza@example.com'],
  ]) {
    emp[code] = await add('employees', { code, name, department, designation, manager, email, created_at: now() });
  }

  for (const [title, department, reports_to, education, experience, responsibilities, skills] of [
    ['HR Manager', 'Human Resources', 'HR Director', 'MBA / BBA in HRM', '5–7 years', 'Lead recruitment, employee relations, performance management, policy implementation and workforce planning.', 'Leadership, HR analytics, communication, labour law and strategic planning'],
    ['Talent Acquisition Officer', 'Human Resources', 'HR Manager', 'BBA / MBA HRM', '2–4 years', 'Manage job postings, screening, interviews, selection and onboarding.', 'Interviewing, sourcing, communication and coordination'],
    ['Training Officer', 'Human Resources', 'HR Manager', 'BBA / MBA HRM', '2–3 years', 'Conduct training needs analysis, coordinate training programmes and evaluate learning outcomes.', 'Facilitation, training design, presentation and evaluation'],
    ['Sales Manager', 'Sales & Marketing', 'Head of Sales', 'MBA / BBA Marketing', '5–7 years', 'Set sales targets, manage sales team, monitor revenue and develop customer relationships.', 'Negotiation, leadership, forecasting and CRM'],
    ['Sales Executive', 'Sales & Marketing', 'Sales Manager', 'BBA / MBA', '1–3 years', 'Generate leads, acquire customers, prepare proposals and achieve sales targets.', 'Communication, persuasion, presentation and CRM'],
    ['Marketing Officer', 'Sales & Marketing', 'Marketing Head', 'BBA / MBA Marketing', '2–4 years', 'Plan campaigns, manage digital channels, analyse market trends and track conversions.', 'Digital marketing, content planning, analytics and creativity'],
  ]) {
    await add('job_descriptions', { title, department, reports_to, education, experience, responsibilities, skills });
  }

  const kra = [];
  for (const [title, department, description, owner] of [
    ['Talent Acquisition', 'Human Resources', 'Attract and recruit qualified employees', 'E002'],
    ['Learning & Development', 'Human Resources', 'Improve employee skills and competencies', 'E003'],
    ['Employee Engagement & Retention', 'Human Resources', 'Improve satisfaction and reduce turnover', 'E001'],
    ['Revenue Generation', 'Sales & Marketing', 'Achieve assigned sales and revenue targets', 'E004'],
    ['Customer Relationship Management', 'Sales & Marketing', 'Develop and maintain customer relationships', 'E005'],
    ['Market Development', 'Sales & Marketing', 'Expand market reach and brand visibility', 'E006'],
  ]) {
    kra.push(await add('kras', { title, department, description, owner_id: emp[owner] }));
  }

  for (const [title, department, target, actual, progress, weight, owner, kraIndex] of [
    ['Time to Hire', 'Human Resources', '30 days', '27 days', 90, 20, 'E002', 0],
    ['Employee Retention Rate', 'Human Resources', '90%', '92%', 102, 30, 'E001', 2],
    ['Training Completion', 'Human Resources', '95%', '88%', 93, 25, 'E003', 1],
    ['Employee Engagement', 'Human Resources', '85%', '82%', 96, 25, 'E001', 2],
    ['Sales Revenue Achievement', 'Sales & Marketing', '100%', '105%', 105, 35, 'E004', 3],
    ['New Customer Acquisition', 'Sales & Marketing', '50', '46', 92, 25, 'E005', 4],
    ['Customer Satisfaction', 'Sales & Marketing', '90%', '87%', 97, 20, 'E004', 4],
    ['Campaign Conversion Rate', 'Sales & Marketing', '12%', '11%', 92, 20, 'E006', 5],
  ]) {
    await add('kpis', { title, department, target, actual, progress, weight, owner_id: emp[owner], kra_id: kra[kraIndex] });
  }

  for (const [objective, key_result, department, progress, owner] of [
    ['Build a high-performing and skilled workforce', 'Complete 95% of employee training plans', 'Human Resources', 88, 'E001'],
    ['Improve talent acquisition efficiency', 'Reduce average hiring time to 30 days', 'Human Resources', 90, 'E002'],
    ['Achieve sustainable sales growth', 'Achieve 100% of annual sales revenue target', 'Sales & Marketing', 95, 'E004'],
    ['Strengthen customer relationships', 'Reach 90% customer satisfaction', 'Sales & Marketing', 87, 'E005'],
  ]) {
    await add('okrs', { objective, key_result, department, progress, owner_id: emp[owner] });
  }

  for (const [owner, kpi_score, competency_score, goal_score, final_score, rating, comments] of [
    ['E001', 92, 90, 91, 91, 'Excellent', 'Strong leadership and employee engagement.'],
    ['E002', 88, 85, 85, 87, 'Very Good', 'Good recruitment delivery.'],
    ['E003', 84, 80, 82, 83, 'Very Good', 'Continue improving training evaluation.'],
    ['E004', 95, 92, 95, 94, 'Excellent', 'Exceeded sales targets.'],
    ['E005', 78, 74, 76, 77, 'Good', 'Development in customer conversion recommended.'],
    ['E006', 87, 84, 84, 86, 'Very Good', 'Good campaign execution.'],
  ]) {
    await add('appraisals', { employee_id: emp[owner], period: 'Q4 2026', kpi_score, competency_score, goal_score, final_score, rating, comments, created_at: now() });
  }

  await add('training', { title: 'Advanced Excel Training', audience: 'HR Department', status: 'In Progress', notes: 'Improve reporting and data analysis skills' });
  await add('training', { title: 'Sales Negotiation', audience: 'Sales & Marketing', status: 'Planned', notes: 'Strengthen customer negotiation skills' });
}
