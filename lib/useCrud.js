'use client';

import { useState } from 'react';
import { api } from './api';
import { useResource } from './useResource';

// Everything a list page needs: the rows, plus open/close form and delete actions.
export function useCrud(table) {
  const { data, error, loading, reload } = useResource(table);
  // form = null (closed) | { id, item } (editing) | { id: null, item: {} } (creating)
  const [form, setForm] = useState(null);

  const openNew = () => {
    setForm({ id: null, item: {} });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openEdit = (item) => {
    setForm({ id: item.id, item });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeForm = () => setForm(null);

  const onSaved = async () => {
    setForm(null);
    await reload();
  };

  const remove = async (id) => {
    if (!confirm('Delete this record permanently from the database?')) return;
    try {
      await api(`${table}/${id}`, { method: 'DELETE' });
      await reload();
    } catch (e) {
      alert(e.message);
    }
  };

  return { rows: data, error, loading, form, openNew, openEdit, closeForm, onSaved, remove };
}
