import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  User,
  Stethoscope,
  FileText,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { dashboardApi, appointmentsApi } from '../../api/client';

export default function DoctorDashboard({ user, onNavigate, showToast }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status update modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [targetStatus, setTargetStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getDoctor();
      setDashboard(data);
    } catch (err) {
      showToast('Failed to load doctor dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openActionModal = (appointment, status) => {
    setSelectedAppointment(appointment);
    setTargetStatus(status);
    setNotes(appointment.notes || '');
    setCancellationReason('');
    setModalOpen(true);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setUpdating(true);
    try {
      await appointmentsApi.updateStatus(selectedAppointment.id, {
        status: targetStatus,
        notes: notes.trim(),
        cancellationReason: cancellationReason.trim()
      });

      showToast(`Appointment marked as ${targetStatus.toLowerCase()}.`, 'success');
      setModalOpen(false);
      loadDashboard();
    } catch (err) {
      showToast(err.message || 'Failed to update appointment status.', 'error');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <Loader2 size={36} className="animate-spin" color="var(--primary-600)" style={{ margin: '0 auto 1rem' }} />
        <div style={{ color: 'var(--slate-600)' }}>Loading physician schedule...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f766e, #065f46)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 2.25rem',
          color: '#ffffff',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6ee7b7' }}>
            Physician Portal
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem', letterSpacing: '-0.02em' }}>
            Welcome, {user?.fullName || 'Doctor'}
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.95rem', maxWidth: '520px', marginTop: '0.4rem' }}>
            View today's patient roster, confirm pending visits, log clinical consultation notes, and configure practice hours.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          style={{ background: '#ffffff', color: 'var(--teal-800)', borderColor: 'transparent' }}
          onClick={() => onNavigate('schedule')}
        >
          <Clock size={16} /> Manage Working Hours
        </button>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Today's Visits</div>
            <div className="stat-value">{dashboard?.todayAppointmentsCount || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-700)' }}>
            <Calendar size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Pending Approval</div>
            <div className="stat-value">{dashboard?.pendingAppointmentsCount || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Confirmed Upcoming</div>
            <div className="stat-value">{dashboard?.confirmedAppointmentsCount || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#065f46' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Total Completed</div>
            <div className="stat-value">{dashboard?.completedAppointmentsCount || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <FileText size={22} />
          </div>
        </div>
      </div>

      {/* Today's Appointments Section */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              <Calendar size={20} color="var(--primary-600)" /> Today's Appointment Schedule
            </div>
            <div className="card-subtitle">Patients scheduled for medical consultation today</div>
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-500)' }}>
            {dashboard?.todayAppointments?.length || 0} Patients
          </span>
        </div>

        {dashboard?.todayAppointments?.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dashboard.todayAppointments.map((app) => (
              <div
                key={app.id}
                style={{
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  background: app.status === 'CONFIRMED' ? '#fafdfb' : '#ffffff'
                }}
              >
                <div style={{ flex: 1, minWidth: '260px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
                    <span className={`status-pill ${app.status}`}>{app.status}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-800)' }}>
                      {app.appointmentTime}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                    {app.patientName}
                  </h3>

                  <div style={{ fontSize: '0.825rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                    Gender: {app.patientGender || 'N/A'} • Blood Group: {app.patientBloodGroup || 'N/A'} • Phone: {app.patientPhone || 'N/A'}
                  </div>

                  <div style={{ marginTop: '0.6rem', fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                    <strong>Reason:</strong> {app.reason}
                  </div>

                  {app.notes && (
                    <div style={{ marginTop: '0.4rem', fontSize: '0.825rem', color: 'var(--primary-800)', background: 'var(--primary-50)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                      <strong>Notes:</strong> {app.notes}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {app.status === 'PENDING' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => openActionModal(app, 'CONFIRMED')}
                    >
                      <Check size={14} /> Confirm
                    </button>
                  )}

                  {(app.status === 'PENDING' || app.status === 'CONFIRMED') && (
                    <>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#0369a1', borderColor: '#bae6fd' }}
                        onClick={() => openActionModal(app, 'COMPLETED')}
                      >
                        <CheckCircle2 size={14} /> Complete Visit
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ color: '#be123c', borderColor: '#fecdd3' }}
                        onClick={() => openActionModal(app, 'CANCELLED')}
                      >
                        <X size={14} /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
            <div className="empty-state-icon">
              <Calendar size={24} />
            </div>
            <div className="empty-state-title">No appointments scheduled today</div>
            <div className="empty-state-text">Your roster for today is completely clear.</div>
          </div>
        )}
      </div>

      {/* Upcoming Appointments */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Clock size={20} color="var(--primary-600)" /> Upcoming Bookings (Next Days)
            </div>
            <div className="card-subtitle">Upcoming medical consultations assigned to you</div>
          </div>
        </div>

        {dashboard?.upcomingAppointments?.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Patient Name</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.upcomingAppointments.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{app.appointmentDate}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{app.appointmentTime}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{app.patientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{app.patientPhone || app.patientEmail}</div>
                    </td>
                    <td style={{ maxWidth: '280px' }}>{app.reason}</td>
                    <td>
                      <span className={`status-pill ${app.status}`}>{app.status}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {app.status === 'PENDING' && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => openActionModal(app, 'CONFIRMED')}
                          >
                            Confirm
                          </button>
                        )}
                        {(app.status === 'PENDING' || app.status === 'CONFIRMED') && (
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#be123c', borderColor: '#fecdd3' }}
                            onClick={() => openActionModal(app, 'CANCELLED')}
                          >
                            Cancel
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
          <div className="empty-state" style={{ padding: '2rem 1rem' }}>
            <div className="empty-state-title">No upcoming appointments</div>
            <div className="empty-state-text">You have no upcoming consultations in the next days.</div>
          </div>
        )}
      </div>

      {/* Action Dialog */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Update Appointment Status to {targetStatus}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate}>
              <div className="modal-body">
                <div style={{ padding: '0.75rem 1rem', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.875rem' }}>
                  <div><strong>Patient:</strong> {selectedAppointment?.patientName}</div>
                  <div><strong>Scheduled:</strong> {selectedAppointment?.appointmentDate} at {selectedAppointment?.appointmentTime}</div>
                  <div><strong>Visit Reason:</strong> {selectedAppointment?.reason}</div>
                </div>

                {targetStatus === 'COMPLETED' && (
                  <div className="form-group">
                    <label className="form-label">Clinical Consultation Notes / Summary</label>
                    <textarea
                      rows={3}
                      className="form-textarea"
                      placeholder="Enter examination notes, recommendations, or follow-up guidelines..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                )}

                {targetStatus === 'CONFIRMED' && (
                  <div className="form-group">
                    <label className="form-label">Preparation Notes for Patient (Optional)</label>
                    <textarea
                      rows={2}
                      className="form-textarea"
                      placeholder="e.g. Please bring recent test records, arrive 10 mins early..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                )}

                {targetStatus === 'CANCELLED' && (
                  <div className="form-group">
                    <label className="form-label">Reason for Cancellation</label>
                    <textarea
                      required
                      rows={2}
                      className="form-textarea"
                      placeholder="e.g. Physician emergency surgery, rescheduling required..."
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={updating}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? 'Updating...' : `Confirm ${targetStatus}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
