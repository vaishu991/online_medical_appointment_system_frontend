import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  PlusCircle,
  User,
  Stethoscope,
  ArrowRight,
  Loader2,
  XCircle
} from 'lucide-react';
import { dashboardApi, appointmentsApi } from '../../api/client';

export default function PatientDashboard({
  user,
  onNavigate,
  onOpenBooking,
  showToast
}) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getPatient();
      setDashboard(data);
    } catch (err) {
      showToast(err.message || 'Failed to load patient dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (appId) => {
    setCancellingId(appId);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!cancellingId) return;
    setCancelling(true);
    try {
      await appointmentsApi.cancel(cancellingId, cancelReason || 'Cancelled by patient');
      showToast('Appointment cancelled successfully.', 'success');
      setCancelModalOpen(false);
      loadDashboard();
    } catch (err) {
      showToast(err.message || 'Failed to cancel appointment.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <Loader2 size={36} className="animate-spin" color="var(--primary-600)" style={{ margin: '0 auto 1rem' }} />
        <div style={{ color: 'var(--slate-600)', fontWeight: 500 }}>Loading patient dashboard...</div>
      </div>
    );
  }

  const nextAppointment = dashboard?.nextAppointments?.[0];

  return (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b, #047857)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem 2.25rem',
          color: '#ffffff',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#a7f3d0' }}>
            Patient Portal
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem', letterSpacing: '-0.02em' }}>
            Welcome back, {user?.fullName || 'Patient'}
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.95rem', maxWidth: '520px', marginTop: '0.4rem' }}>
            Browse certified healthcare providers, view up-to-date schedule availability, and easily manage your appointments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            style={{ background: '#ffffff', color: 'var(--primary-900)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
            onClick={() => onOpenBooking()}
          >
            <PlusCircle size={17} color="#047857" /> Book Appointment
          </button>
          <button
            className="btn btn-secondary"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
            onClick={() => onNavigate('doctors')}
          >
            <Search size={17} /> Browse Doctors
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Upcoming Visits</div>
            <div className="stat-value">{dashboard?.upcomingAppointments || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-700)' }}>
            <Calendar size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Pending Approval</div>
            <div className="stat-value">{dashboard?.pendingAppointments || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Completed Visits</div>
            <div className="stat-value">{dashboard?.completedAppointments || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Total History</div>
            <div className="stat-value">{dashboard?.totalAppointments || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--slate-100)', color: 'var(--slate-700)' }}>
            <Stethoscope size={22} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Next Scheduled Appointment Highlight */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Calendar size={20} color="var(--primary-600)" /> Next Upcoming Visit
              </div>
              <div className="card-subtitle">Your immediate upcoming medical consultation</div>
            </div>
            {nextAppointment && (
              <span className={`status-pill ${nextAppointment.status}`}>
                {nextAppointment.status}
              </span>
            )}
          </div>

          {nextAppointment ? (
            <div style={{ padding: '1.25rem', background: 'var(--primary-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-900)' }}>
                    {nextAppointment.doctorName}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary-700)', fontWeight: 500 }}>
                    {nextAppointment.specialtyName} • {nextAppointment.roomNumber}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary-700)', fontWeight: 600 }}>Date & Time</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary-900)' }}>
                    {nextAppointment.appointmentDate} at {nextAppointment.appointmentTime}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--primary-200)', paddingTop: '0.75rem', marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--primary-800)' }}>
                <strong>Reason:</strong> {nextAppointment.reason}
              </div>

              {nextAppointment.notes && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: 'var(--primary-700)', background: '#ffffff', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  <strong>Physician Note:</strong> {nextAppointment.notes}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#be123c', borderColor: '#fecdd3' }}
                  onClick={() => handleCancelClick(nextAppointment.id)}
                >
                  <XCircle size={14} /> Cancel Booking
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <div className="empty-state-icon">
                <Calendar size={24} />
              </div>
              <div className="empty-state-title">No upcoming appointments</div>
              <div className="empty-state-text">
                You don't have any pending or confirmed visits scheduled. Book an appointment anytime!
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => onOpenBooking()}>
                Book Appointment Now
              </button>
            </div>
          )}
        </div>

        {/* Recent Appointments List */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Clock size={20} color="var(--primary-600)" /> Recent Bookings
              </div>
              <div className="card-subtitle">Latest bookings & historical visits</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('appointments')}>
              View All <ArrowRight size={14} />
            </button>
          </div>

          {dashboard?.recentHistory?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {dashboard.recentHistory.map((app) => (
                <div
                  key={app.id}
                  style={{
                    padding: '0.85rem 1rem',
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--slate-800)', fontSize: '0.9rem' }}>
                      {app.doctorName}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                      {app.specialtyName} • {app.appointmentDate} at {app.appointmentTime}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span className={`status-pill ${app.status}`}>{app.status}</span>
                    {(app.status === 'PENDING' || app.status === 'CONFIRMED') && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#be123c' }}
                        onClick={() => handleCancelClick(app.id)}
                        title="Cancel appointment"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <div className="empty-state-title">No bookings found</div>
              <div className="empty-state-text">Your appointment records will appear here once booked.</div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="modal-backdrop" onClick={() => setCancelModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#9f1239' }}>Cancel Appointment</h3>
              <button onClick={() => setCancelModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <XCircle size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginBottom: '1rem' }}>
                Are you sure you want to cancel this scheduled appointment? This slot will become available for other patients.
              </p>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Cancellation Reason (Optional)</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  placeholder="e.g. Schedule conflict, feeling better..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCancelModalOpen(false)} disabled={cancelling}>
                Keep Appointment
              </button>
              <button className="btn btn-danger" onClick={confirmCancel} disabled={cancelling}>
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
