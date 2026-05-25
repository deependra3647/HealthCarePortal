import { useEffect, useState, useCallback } from 'react';
import { doctorsApi } from '../api/client';
import PageHeader from '../components/PageHeader';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { IconPlus, IconSearch, IconDoctors } from '../components/Icons';

const empty = {
  name: '',
  email: '',
  phone: '',
  specialization: '',
  department: '',
  consultationFee: '',
};

export default function Doctors() {
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDoctors = useCallback((specializationQuery) => {
    setLoading(true);
    setError('');
    const params = specializationQuery ? { specialization: specializationQuery } : {};
    return doctorsApi
      .list(params)
      .then(setList)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDoctors(search.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchDoctors]);

  const openCreate = () => {
    setForm(empty);
    setModal('create');
  };

  const openEdit = (d) => {
    setForm({
      name: d.name,
      email: d.email || '',
      phone: d.phone,
      specialization: d.specialization,
      department: d.department || '',
      consultationFee: d.consultationFee ?? '',
    });
    setModal(d._id);
  };

  const save = async (e) => {
    e.preventDefault();
    const body = { ...form, consultationFee: Number(form.consultationFee) || 0 };
    if (modal === 'create') await doctorsApi.create(body);
    else await doctorsApi.update(modal, body);
    setModal(null);
    fetchDoctors(search.trim());
  };

  const remove = async (id) => {
    if (!confirm('Delete this doctor?')) return;
    await doctorsApi.remove(id);
    fetchDoctors(search.trim());
  };

  return (
    <div>
      <PageHeader
        title="Doctors"
        subtitle="Search doctors by specialization and manage profiles"
        action={
          <button type="button" className="btn-primary" onClick={openCreate}>
            <IconPlus />
            Add doctor
          </button>
        }
      />
      {error && <p className="error-msg">{error}</p>}
      <div className="toolbar-card">
        <p className="toolbar-count">
          <span>{list.length}</span> medical staff
        </p>
        <div className="search-box">
          <IconSearch />
          <input
            type="search"
            placeholder="Search by specialization (e.g. Cardiology)..."
            aria-label="Search doctors by specialization"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="card table-wrap" style={{ padding: 0 }}>
        {loading ? (
          <div className="empty-state">Loading doctors...</div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <IconDoctors />
            </div>
            <h4>No doctors found</h4>
            <p>{search ? 'No doctor found for that specialization' : 'Add doctors to enable appointment booking'}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Department</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((d) => (
                <tr key={d._id}>
                  <td>
                    <div className="cell-user">
                      <Avatar name={d.name} />
                      <strong>{d.name}</strong>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-completed">{d.specialization}</span>
                  </td>
                  <td>{d.department || '—'}</td>
                  <td>{d.phone}</td>
                  <td>
                    <div className="action-group">
                      <button type="button" className="btn-secondary btn-sm" onClick={() => openEdit(d)}>
                        Edit
                      </button>
                      <button type="button" className="btn-danger btn-sm" onClick={() => remove(d._id)}>
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
        <Modal title={modal === 'create' ? 'New doctor' : 'Edit doctor'} onClose={() => setModal(null)}>
          <form onSubmit={save}>
            <div className="form-group">
              <label>Full name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Specialization</label>
              <input
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                placeholder="e.g. Cardiology"
                required
              />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Department</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save doctor
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
