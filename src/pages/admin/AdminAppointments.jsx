import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  Edit,
  X
} from 'lucide-react';
import { appointmentsApi, doctorsApi } from '../../api/client';
import { formatINR } from '../../utils/formatINR';

export default function AdminAppointments({ showToast }) {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Status Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [targetStatus, setTargetStatus] = useState('CONFIRMED');
  const [notes, setNotes] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancellationDetails, setCancellationDetails] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, doctorFilter, dateFilter]);

  const loadDoctors = async () => {
    try {
      const data = await doctorsApi.getAll({ includeInactive: true });
      setDoctors(data || []);
    } catch {
      // ignore
    }
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (doctorFilter) filters.doctorId = doctorFilter;
      if (dateFilter) filters.date = dateFilter;

      const data = await appointmentsApi.getAll(filters);
      setAppointments(data || []);
    } catch (err) {
      showToast('Failed to load appointments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openStatusModal = (app, nextStatus = app.status) => {
    setSelectedApp(app);
    setTargetStatus(nextStatus);
    setNotes(app.notes || '');
    setCancellationReason(app.cancellationReason || (nextStatus === 'CANCELLED' ? 'Doctor is on leave' : ''));
    setCancellationDetails('');
    setModalOpen(true);
  };

  const handleProceed = async (app) => {
    setUpdating(true);
    try {
      await appointmentsApi.updateStatus(app.id, { status: 'CONFIRMED' });
      showToast(`Appointment #${app.id} for ${app.patientName} is confirmed.`, 'success');
      await loadAppointments();
    } catch (err) {
      showToast(err.message || 'Could not confirm this appointment.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setUpdating(true);
    try {
      const finalCancellationReason = [cancellationReason, cancellationDetails.trim()]
        .filter(Boolean)
        .join(': ');
      await appointmentsApi.updateStatus(selectedApp.id, {
        status: targetStatus,
        notes: notes.trim(),
        cancellationReason: finalCancellationReason
      });
      showToast(
        targetStatus === 'CANCELLED'
          ? `Appointment #${selectedApp.id} cancelled for ${selectedApp.patientName}.`
          : 'Appointment record updated.',
        'success'
      );
      setModalOpen(false);
      await loadAppointments();
    } catch (err) {
      showToast(err.message || 'Status update failed.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
          All Hospital Appointments & Bookings
        </h1>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
          Manage bookings on behalf of patients. Confirm pending appointments or cancel them when a doctor is on leave or overbooked.
        </p>
      </div>

      {/* Filters Card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Filter by Status</label>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Filter by Physician</label>
            <select className="form-select" value={doctorFilter} onChange={(e) => setDoctorFilter(e.target.value)}>
              <option value="">All Physicians</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.fullName} ({d.specialtyName})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.78rem' }}>Filter by Date</label>
            <input
              type="date"
              className="form-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            {(statusFilter || doctorFilter || dateFilter) && (
              <button
                className="btn btn-secondary btn-sm"
                style={{ height: '38px', width: '100%' }}
                onClick={() => {
                  setStatusFilter('');
                  setDoctorFilter('');
                  setDateFilter('');
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Loader2 size={32} className="animate-spin" color="var(--primary-600)" style={{ margin: '0 auto 0.75rem' }} />
            <div style={{ color: 'var(--slate-600)' }}>Loading appointments...</div>
          </div>
        ) : appointments.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((app) => (
                  <tr key={app.id}>
                    <td><strong>#{app.id}</strong></td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{app.patientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        {app.patientEmail} • {app.patientPhone || 'No phone'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{app.doctorName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)' }}>
                        {app.specialtyName} • {formatINR(app.consultationFee)}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{app.appointmentDate}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{app.appointmentTime}</div>
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '0.825rem' }}>
                      {app.reason}
                      {app.notes && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)', marginTop: '0.2rem' }}>
                          Note: {app.notes}
                        </div>
                      )}
                      {app.cancellationReason && (
                        <div style={{ fontSize: '0.75rem', color: '#be123c', marginTop: '0.2rem' }}>
                          Cancelled: {app.cancellationReason}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`status-pill ${app.status}`}>{app.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', minWidth: '190px' }}>
                        {app.status === 'PENDING' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleProceed(app)}
                            disabled={updating}
                            title="Confirm this appointment for the patient"
                          >
                            <CheckCircle2 size={13} /> {updating ? 'Saving...' : 'Proceed'}
                          </button>
                        )}
                        {(app.status === 'PENDING' || app.status === 'CONFIRMED') && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => openStatusModal(app, 'CANCELLED')}
                            disabled={updating}
                            title="Cancel this appointment on behalf of the patient"
                          >
                            <XCircle size={13} /> Cancel
                          </button>
                        )}
                        {app.status !== 'CANCELLED' && app.status !== 'COMPLETED' && (
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => openStatusModal(app)}
                            title="Edit appointment status or administrative notes"
                          >
                            <Edit size={13} /> Edit
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">No appointments found</div>
            <div className="empty-state-text">No appointment records match the current filter selection.</div>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                {targetStatus === 'CANCELLED' ? 'Cancel Appointment' : `Update Appointment #${selectedApp?.id}`}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate}>
              <div className="modal-body">
                <div style={{ padding: '0.75rem 1rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                  <div><strong>Patient:</strong> {selectedApp?.patientName}</div>
                  <div><strong>Doctor:</strong> {selectedApp?.doctorName} ({selectedApp?.specialtyName})</div>
                  <div><strong>Date:</strong> {selectedApp?.appointmentDate} at {selectedApp?.appointmentTime}</div>
                </div>

                {targetStatus === 'CANCELLED' && (
                  <div style={{ padding: '0.75rem 1rem', background: '#fff7ed', color: '#9a3412', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                    This cancels the booking on behalf of the patient. The cancellation reason will appear in the patient’s appointment history.
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Appointment Status</label>
                  <select
                    className="form-select"
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Administrative / Clinical Notes</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    placeholder="Enter any notes or instructions..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                {targetStatus === 'CANCELLED' && (
                  <>
                    <div className="form-group">
                      <label className="form-label">Cancellation Reason</label>
                      <select
                        className="form-select"
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        required
                      >
                        <option value="">Choose a reason</option>
                        <option value="Doctor is on leave">Doctor is on leave</option>
                        <option value="Doctor has high patient volume">Doctor has high patient volume</option>
                        <option value="Doctor is unavailable">Doctor is unavailable</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Additional Details {cancellationReason === 'Other' ? '(required)' : '(optional)'}</label>
                      <textarea
                        rows={2}
                        className="form-textarea"
                        placeholder="Add details the patient should see..."
                        value={cancellationDetails}
                        onChange={(e) => setCancellationDetails(e.target.value)}
                        required={cancellationReason === 'Other'}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={updating}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? 'Saving...' : targetStatus === 'CANCELLED' ? 'Confirm Cancellation' : 'Save Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
