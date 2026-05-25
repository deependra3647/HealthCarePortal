import { useEffect, useState, useMemo } from 'react';
import { appointmentsApi, patientsApi, doctorsApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/PageHeader';
import Avatar from '../components/Avatar';
import Modal from '../components/Modal';
import { IconPlus, IconSearch, IconCalendar } from '../components/Icons';

const STATUSES = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const empty = { patient: '', doctor: '', date: '', time: '', status: 'scheduled', notes: '' };

function toDateInput(iso) {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
}

export default function Appointments() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [list, setList] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(empty);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [a, p, d] = await Promise.all([
        appointmentsApi.list(),
        patientsApi.list(),
        doctorsApi.list(),
      ]);
      setList(a);
      setPatients(p);
      setDoctors(d);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (a) =>
        a.patient?.name?.toLowerCase().includes(q) ||
        a.doctor?.name?.toLowerCase().includes(q) ||
        a.status?.includes(q)
    );
  }, [list, search]);

  const openCreate = () => {
    setForm(empty);
    setModal('create');
  };

  const openEdit = (a) => {
    setForm({
      patient: a.patient?._id || a.patient,
      doctor: a.doctor?._id || a.doctor,
      date: toDateInput(a.date),
      time: a.time,
      status: a.status,
      notes: a.notes || '',
    });
    setModal(a._id);
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const body = {
        ...form,
        date: new Date(form.date).toISOString(),
        patient: form.patient,
        doctor: form.doctor,
      };
      if (modal === 'create') await appointmentsApi.create(body);
      else await appointmentsApi.update(modal, body);
      setModal(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const changeStatus = async (id, status) => {
    setStatusUpdating(id);
    setError('');
    try {
      const updated = await appointmentsApi.updateStatus(id, status);
      setList((prev) => prev.map((a) => (a._id === id ? updated : a)));
    } catch (err) {
      setError(err.message);
      load();
    } finally {
      setStatusUpdating(null);
    }
  };

  const remove = async (id) => {
    if (!confirm('Delete this appointment permanently?')) return;
    await appointmentsApi.remove(id);
    load();
  };

  const statusClass = (s) => `badge badge-${s}`;

  const modalTitle =
    modal === 'create' ? 'Book appointment' : isAdmin ? 'Edit appointment' : 'Appointment details';

  return (
    <div>
      <PageHeader
        title="Appointments"
        subtitle={
          isAdmin
            ? 'Book visits and update status (scheduled, completed, cancelled)'
            : 'Book and view patient visits'
        }
        action={
          <button type="button" className="btn-primary" onClick={openCreate}>
            <IconPlus />
            Book appointment
          </button>
        }
      />
      {error && <p className="error-msg">{error}</p>}
      <div className="toolbar-card">
        <p className="toolbar-count">
          <span>{list.length}</span> total bookings
        </p>
        <div className="search-box">
          <IconSearch />
          <input
            type="search"
            placeholder="Search patient, doctor, status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <div className="card table-wrap" style={{ padding: 0 }}>
        {loading ? (
          <div className="empty-state">Loading appointments...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <IconCalendar />
            </div>
            <h4>No appointments</h4>
            <p>Schedule a visit between a patient and doctor</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a._id}>
                  <td>
                    <div className="cell-user">
                      <Avatar name={a.patient?.name} size="sm" />
                      {a.patient?.name}
                    </div>
                  </td>
                  <td>
                    <div className="cell-user">
                      <Avatar name={a.doctor?.name} size="sm" />
                      <div>
                        {a.doctor?.name}
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                          {a.doctor?.specialization}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>{new Date(a.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                  <td>
                    <strong>{a.time}</strong>
                  </td>
                  <td>
                    {isAdmin ? (
                      <select
                        className={`status-select status-${a.status}`}
                        value={a.status}
                        disabled={statusUpdating === a._id}
                        onChange={(e) => changeStatus(a._id, e.target.value)}
                        aria-label={`Status for ${a.patient?.name}`}
                      >
                        {STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={statusClass(a.status)}>{a.status}</span>
                    )}
                  </td>
                  <td>
                    <div className="action-group">
                      {isAdmin && (
                        <button type="button" className="btn-secondary btn-sm" onClick={() => openEdit(a)}>
                          Edit
                        </button>
                      )}
                      <button type="button" className="btn-danger btn-sm" onClick={() => remove(a._id)}>
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
        <Modal title={modalTitle} onClose={() => setModal(null)}>
          <form onSubmit={save}>
            <div className="form-group">
              <label>Patient</label>
              <select
                value={form.patient}
                onChange={(e) => setForm({ ...form, patient: e.target.value })}
                required
              >
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Doctor</label>
              <select
                value={form.doctor}
                onChange={(e) => setForm({ ...form, doctor: e.target.value })}
                required
              >
                <option value="">Select doctor</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} — {d.specialization}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                required
              />
            </div>
            {isAdmin && modal !== 'create' && (
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="form-group">
              <label>Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Optional notes..."
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {modal === 'create' ? 'Confirm booking' : 'Save changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
