import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  PlusCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { appointmentsApi } from '../../api/client';
import { formatINR } from '../../utils/formatINR';

export default function AppointmentHistory({ onOpenBooking, showToast }) {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const filters = statusFilter !== 'ALL' ? { status: statusFilter } : {};
      const data = await appointmentsApi.getAll(filters);
      setAppointments(data || []);
    } catch (err) {
      showToast('Failed to load appointments.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (id) => {
    setCancellingId(id);
    setCancelReason('');
    setCancelModalOpen(true);
  };

  const confirmCancel = async () => {
    if (!cancellingId) return;
    setCancelling(true);
    try {
      await appointmentsApi.cancel(cancellingId, cancelReason || 'Cancelled by patient');
      showToast('Appointment successfully cancelled.', 'success');
      setCancelModalOpen(false);
      loadAppointments();
    } catch (err) {
      showToast(err.message || 'Failed to cancel appointment.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const statuses = ['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
            My Appointment Bookings
          </h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Review your upcoming consultations, completed checkups, and booking history.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => onOpenBooking()}>
          <PlusCircle size={16} /> Book New Appointment
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {statuses.map((st) => (
          <button
            key={st}
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter(st)}
          >
            {st}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Loader2 size={36} className="animate-spin" color="var(--primary-600)" style={{ margin: '0 auto 1rem' }} />
          <div style={{ color: 'var(--slate-600)' }}>Loading appointments...</div>
        </div>
      ) : appointments.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {appointments.map((app) => (
            <div key={app.id} className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
                    <span className={`status-pill ${app.status}`}>{app.status}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>
                      Booking ID: #{app.id}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                    {app.doctorName}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', fontWeight: 500 }}>
                    {app.specialtyName} • {app.roomNumber}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>Scheduled For</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                    {app.appointmentDate} at {app.appointmentTime}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.2rem' }}>
                    Fee: {formatINR(app.consultationFee)}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid var(--slate-100)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--slate-700)' }}>
                  <strong>Reason:</strong> {app.reason}
                </div>

                {app.notes && (
                  <div style={{ fontSize: '0.825rem', color: 'var(--primary-800)', background: 'var(--primary-50)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--primary-100)' }}>
                    <strong>Doctor's Clinical Notes:</strong> {app.notes}
                  </div>
                )}

                {app.cancellationReason && (
                  <div style={{ fontSize: '0.825rem', color: '#9f1239', background: '#ffe4e6', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                    <strong>Cancellation Reason:</strong> {app.cancellationReason}
                  </div>
                )}
              </div>

              {(app.status === 'PENDING' || app.status === 'CONFIRMED') && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100)' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#be123c', borderColor: '#fecdd3' }}
                    onClick={() => handleCancelClick(app.id)}
                  >
                    <XCircle size={14} /> Cancel Appointment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <Calendar size={28} />
          </div>
          <div className="empty-state-title">No appointments found</div>
          <div className="empty-state-text">
            {statusFilter !== 'ALL'
              ? `You have no appointments with status "${statusFilter}".`
              : "You haven't scheduled any medical appointments yet."}
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => onOpenBooking()}>
            Book Your First Appointment
          </button>
        </div>
      )}

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
                Please confirm you want to cancel this booking. The physician's time slot will be reopened.
              </p>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Reason for Cancellation</label>
                <textarea
                  rows={2}
                  className="form-textarea"
                  placeholder="Provide reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setCancelModalOpen(false)} disabled={cancelling}>
                Back
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
