import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../api/api';
import { USE_BACKEND } from '../constants/appConfig';
import { getErrorMessage, toArray } from '../utils/appointments';
import './AdminHealthQuests.css';

const CATEGORY_SUGGESTIONS = ['Daily', 'Fitness', 'Wellness', 'Nutrition'];

const EMPTY_FORM = { title: '', description: '', category: 'Daily', active: true };

export default function AdminHealthQuests() {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(USE_BACKEND);
  const [message, setMessage] = useState(
    USE_BACKEND ? '' : 'Health quests need the PulseUp backend. Set VITE_USE_BACKEND=true to manage them.',
  );
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!USE_BACKEND) {
      return;
    }

    try {
      const response = await api.get('/health-quests');

      setQuests(toArray(response.data));
    } catch (error) {
      console.error('Could not load health quests:', error);
      setMessage(getErrorMessage(error, 'Health quests could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const activeCount = useMemo(() => quests.filter((quest) => quest.active).length, [quests]);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  }

  function openEdit(quest) {
    setEditingId(quest.questId);
    setForm({
      title: quest.title,
      description: quest.description,
      category: quest.category,
      active: quest.active,
    });
    setFormOpen(true);
  }

  async function run(action, successText, failureText) {
    try {
      setSaving(true);
      setMessage('');
      await action();
      await load();
      setMessage(successText);
      return true;
    } catch (error) {
      console.error(failureText, error);
      setMessage(getErrorMessage(error, failureText));
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim() || !form.category.trim()) {
      setMessage('Enter a title, description and category.');
      return;
    }

    const body = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
      active: form.active,
    };

    const done = await run(
      () => (editingId ? api.put(`/health-quests/${editingId}`, body) : api.post('/health-quests', body)),
      editingId ? 'The health quest was updated.' : 'The health quest was created.',
      'The health quest could not be saved.',
    );

    if (done) {
      setFormOpen(false);
    }
  }

  function toggleActive(quest) {
    run(
      () => api.patch(`/health-quests/${quest.questId}/active`, null, { params: { active: !quest.active } }),
      quest.active ? 'The quest is hidden from students.' : 'The quest is now visible to students.',
      'The quest could not be updated.',
    );
  }

  function remove(quest) {
    if (!window.confirm(`Delete "${quest.title}"? Students will no longer see it.`)) {
      return;
    }

    run(
      () => api.delete(`/health-quests/${quest.questId}`),
      'The health quest was deleted.',
      'The health quest could not be deleted.',
    );
  }

  return (
    <div className="admin-healthquests-page">
      <div className="hq-page-intro">
        <div>
          <h2>Health Quests</h2>
          <p>Create the wellness quests students see on their Health Quests page.</p>
        </div>
        <button type="button" onClick={openCreate} disabled={!USE_BACKEND}>+ Create Health Quest</button>
      </div>

      <section className="hq-admin-stats">
        <article className="total"><div>Total quests</div><strong>{quests.length}</strong></article>
        <article className="completed"><div>Visible to students</div><strong>{activeCount}</strong></article>
        <article className="pending"><div>Hidden</div><strong>{quests.length - activeCount}</strong></article>
      </section>

      {message && <p className="admin-empty" role="status">{message}</p>}

      <section className="hq-admin-table-panel">
        <div className="hq-table-title"><h3>All health quests</h3></div>
        <div className="hq-table-scroll">
          <table>
            <thead>
              <tr><th>Title</th><th>Category</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="4">Loading health quests...</td></tr>}
              {!loading && quests.length === 0 && (
                <tr><td colSpan="4">No health quests yet. Create one for students to see.</td></tr>
              )}
              {quests.map((quest) => (
                <tr key={quest.questId}>
                  <td><strong>{quest.title}</strong><small>{quest.description}</small></td>
                  <td>{quest.category}</td>
                  <td>
                    <span className={`hq-status ${quest.active ? 'completed' : 'pending'}`}>
                      {quest.active ? 'Visible' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div className="hq-row-actions">
                      <button type="button" className="hq-view" disabled={saving} onClick={() => openEdit(quest)}>Edit</button>
                      <button type="button" className="hq-view" disabled={saving} onClick={() => toggleActive(quest)}>
                        {quest.active ? 'Hide' : 'Show'}
                      </button>
                      <button type="button" className="hq-download" disabled={saving} onClick={() => remove(quest)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {formOpen && (
        <div className="admin-modal-backdrop" onMouseDown={() => setFormOpen(false)}>
          <section className="hq-modal wide" onMouseDown={(e) => e.stopPropagation()}>
            <div className="admin-modal-head">
              <h2>{editingId ? 'Edit Health Quest' : 'Create Health Quest'}</h2>
              <button type="button" aria-label="Close" onClick={() => setFormOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="hq-form-grid">
                <label>
                  Title
                  <input maxLength="120" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </label>
                <label>
                  Category
                  <input list="hq-categories" maxLength="50" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                  <datalist id="hq-categories">
                    {CATEGORY_SUGGESTIONS.map((category) => <option key={category} value={category} />)}
                  </datalist>
                </label>
                <label style={{ gridColumn: '1 / -1' }}>
                  Description
                  <textarea rows="4" maxLength="500" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </label>
                <label>
                  <span>Visible to students</span>
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                </label>
              </div>
              <div className="hq-modal-actions">
                <button type="button" onClick={() => setFormOpen(false)}>Cancel</button>
                <button type="submit" disabled={saving}>{editingId ? 'Save changes' : 'Create quest'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
