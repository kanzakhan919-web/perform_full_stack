'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DEPARTMENTS, SCHEMAS, TRAINING_STATUSES } from '@/lib/config';

// Create / edit form for any table. Fields come from SCHEMAS in lib/config.js.
export default function RecordForm({ table, id, item = {}, onClose, onSaved }) {
  const { singular, fields } = SCHEMAS[table];
  const needsEmployees = fields.some(([, , type]) => type === 'employee');
  const needsKras = fields.some(([, , type]) => type === 'kra');

  const [values, setValues] = useState(() =>
    Object.fromEntries(
      fields.map(([key, , type]) => {
        let value = item[key] ?? '';
        if (value === '' && type === 'dept') value = DEPARTMENTS[0];
        if (value === '' && type === 'status') value = TRAINING_STATUSES[0];
        return [key, String(value)];
      })
    )
  );
  const [employees, setEmployees] = useState([]);
  const [kras, setKras] = useState([]);
  const [saving, setSaving] = useState(false);

  // Load dropdown options (employees / KRAs) only if this form needs them.
  useEffect(() => {
    if (needsEmployees) api('employees').then(setEmployees).catch(() => {});
    if (needsKras) api('kras').then(setKras).catch(() => {});
  }, [needsEmployees, needsKras]);

  const setField = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    const body = {};
    for (const [key, , type] of fields) {
      const value = values[key];
      if (type === 'number') body[key] = Number(value || 0);
      else if (type === 'employee' || type === 'kra') body[key] = value ? Number(value) : null;
      else body[key] = value;
    }

    setSaving(true);
    try {
      await api(table + (id ? '/' + id : ''), {
        method: id ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      });
      await onSaved();
      alert('Record saved successfully in database.');
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  function renderControl(key, type) {
    const props = { name: key, value: values[key], onChange: setField(key) };

    switch (type) {
      case 'dept':
        return (
          <select {...props}>
            {DEPARTMENTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        );
      case 'status':
        return (
          <select {...props}>
            {TRAINING_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        );
      case 'employee':
        return (
          <select {...props}>
            <option value="">Select employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={String(emp.id)}>
                {emp.name} ({emp.code})
              </option>
            ))}
          </select>
        );
      case 'kra':
        return (
          <select {...props}>
            <option value="">No linked KRA</option>
            {kras.map((k) => (
              <option key={k.id} value={String(k.id)}>
                {k.title}
              </option>
            ))}
          </select>
        );
      case 'textarea':
        return <textarea {...props} />;
      case 'number':
        return <input {...props} type="number" min="0" max="100" />;
      default:
        return <input {...props} type={type} required={key === 'code'} />;
    }
  }

  return (
    <div className="card form-card">
      <div className="row">
        <b>
          {id ? 'Edit' : 'Create'} {singular}
        </b>
        <button className="btn alt" type="button" onClick={onClose}>
          Close
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="formgrid">
          {fields.map(([key, label, type]) => (
            <div key={key}>
              <label>{label}</label>
              {renderControl(key, type)}
            </div>
          ))}
        </div>
        <div className="row form-footer">
          <span className="muted">Fields are saved to the MongoDB database.</span>
          <button className="btn" type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save record'}
          </button>
        </div>
      </form>
    </div>
  );
}
