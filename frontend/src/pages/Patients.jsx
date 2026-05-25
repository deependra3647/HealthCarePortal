import { useEffect, useState, useCallback } from 'react';
import { patientsApi } from '../api/client';
import PageHeader from '../components/PageHeader';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { IconPlus, IconSearch, IconPatients } from '../components/Icons';

const empty = { name: '', email: '', phone: '', gender: '', bloodGroup: '', address: '' };

export default function Patients() {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchPatients = useCallback((nameQuery) => {
    setLoading(true);
    setError('');
    const params = nameQuery ? { name: nameQuery } : {};
    return patientsApi
      .list(params)
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchPatients]);

  const openCreate = () => {
    setForm(empty);
    setModal('create');
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      email: p.email || '',
      phone: p.phone,
      gender: p.gender || '',
      bloodGroup: p.bloodGroup || '',
      address: p.address || '',
    });
    setModal(p._id);
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (modal === 'create') await patientsApi.create(form);
      else await patientsApi.update(modal, form);
      setModal(null);
      fetchPatients(search.trim());
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this patient?')) return;
    await patientsApi.remove(id);
    fetchPatients(search.trim());
  };

  return (
    <div>
      <PageHeader
        title="Patients"
        subtitle="Search patients by name and manage records"
        action={
          <button type="button" className="btn-primary" onClick={openCreate}>
            <IconPlus />
            Add patient
          </button>
        }
      />
      {error && <p className="error-msg">{error}</p>}
      <div className="toolbar-card">
        <p className="toolbar-count">
          <span>{list.length}</span> registered patients
        </p>
        <div className="search-box">
          <IconSearch />
          <input
            type="search"
            placeholder="Search by patient name..."
            aria-label="Search patients by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="card table-wrap" style={{ padding: 0 }}>
        {loading ? (
          <div className="empty-state">Loading patients...</div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <IconPatients />
            </div>
            <h4>No patients found</h4>
            <p>{search ? 'No patient found with that name' : 'Add your first patient to get started'}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>Blood group</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="cell-user">
                      <Avatar name={p.name} />
                      <div>
                        <strong>{p.name}</strong>
                        {p.email && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{p.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>{p.phone}</td>
                  <td style={{ textTransform: 'capitalize' }}>{p.gender || '—'}</td>
                  <td>
                    {p.bloodGroup ? (
                      <span className="badge badge-scheduled">{p.bloodGroup}</span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <div className="action-group">
                      <button type="button" className="btn-secondary btn-sm" onClick={() => openEdit(p)}>
                        Edit
                      </button>
                      <button type="button" className="btn-danger btn-sm" onClick={() => remove(p._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {modal && (
        <Modal title={modal === 'create' ? 'New patient' : 'Edit patient'} onClose={() => setModal(null)}>
          <form onSubmit={save}>
            <div className="form-group">
              <label>Full name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Blood group</label>
              <input value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} placeholder="e.g. O+" />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save patient
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
