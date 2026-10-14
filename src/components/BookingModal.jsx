import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Stethoscope, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { doctorsApi, appointmentsApi } from '../api/client';
import { formatINR } from '../utils/formatINR';

export default function BookingModal({
  isOpen,
  onClose,
  initialDoctorId = null,
  onBookingSuccess
}) {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId || '');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');

  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Today in YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (isOpen) {
      loadDoctors();
      if (!selectedDate) {
        setSelectedDate(todayStr);
      }
      if (initialDoctorId) {
        setSelectedDoctorId(initialDoctorId);
      }
    }
  }, [isOpen, initialDoctorId]);

  useEffect(() => {
    if (selectedDoctorId && selectedDate) {
      loadSlots(selectedDoctorId, selectedDate);
    } else {
      setAvailableSlots([]);
      setSelectedTime('');
    }
  }, [selectedDoctorId, selectedDate]);

  const loadDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const data = await doctorsApi.getAll();
      setDoctors(data || []);
      if (!selectedDoctorId && data?.length > 0) {
        setSelectedDoctorId(data[0].id);
      }
    } catch (err) {
      setError('Failed to load doctor directory.');
    } finally {
      setLoadingDoctors(false);
    }
  };

  const loadSlots = async (docId, date) => {
    setLoadingSlots(true);
    setError('');
    setSelectedTime('');
    try {
      const slots = await doctorsApi.getAvailability(docId, date);
      setAvailableSlots(slots || []);
    } catch (err) {
      setError('Could not retrieve available time slots.');
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const selectedDoctor = doctors.find((d) => String(d.id) === String(selectedDoctorId));

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedTime) {
      setError('Please select an available appointment time slot.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a reason for the consultation.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const appointment = await appointmentsApi.book({
        doctorId: selectedDoctorId,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reason: reason.trim()
      });

      onBookingSuccess(appointment);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to book appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="brand-icon-box" style={{ width: '2.2rem', height: '2.2rem' }}>
              <Calendar size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                Schedule Medical Appointment
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                Select doctor, date, and available time slot
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-400)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleBook}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            {/* Doctor Selection */}
            <div className="form-group">
              <label className="form-label">Select Physician</label>
              <select
                className="form-select"
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                disabled={loadingDoctors || submitting}
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} — {d.specialtyName} ({formatINR(d.consultationFee)})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Doctor Summary Card */}
            {selectedDoctor && (
              <div
                style={{
                  background: 'var(--primary-50)',
                  border: '1px solid var(--primary-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-900)', fontSize: '0.925rem' }}>
                    {selectedDoctor.fullName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary-700)' }}>
                    {selectedDoctor.specialtyName} • {selectedDoctor.qualification} • {selectedDoctor.roomNumber}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Consultation Fee
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-800)' }}>
                    {formatINR(selectedDoctor.consultationFee)}
                  </div>
                </div>
              </div>
            )}

            {/* Date Selection */}
            <div className="form-group">
              <label className="form-label">Appointment Date</label>
              <input
                type="date"
                required
                min={todayStr}
                className="form-input"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Slot Picker */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Available Time Slots</span>
                {loadingSlots && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary-600)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Loader2 size={13} className="animate-spin" /> Loading slots...
                  </span>
                )}
              </label>

              {!loadingSlots && availableSlots.length === 0 && (
                <div style={{ padding: '1rem', background: 'var(--slate-100)', borderRadius: 'var(--radius-md)', textAlign: 'center', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                  No available working hours or open slots for this doctor on this day. Please pick another date.
                </div>
              )}

              {!loadingSlots && availableSlots.length > 0 && (
                <div className="slots-grid">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedTime === slot.time;
                    return (
                      <button
                        type="button"
                        key={slot.time}
                        disabled={!slot.available}
                        title={slot.reason || 'Available'}
                        className={`slot-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedTime(slot.time)}
                      >
                        {slot.formattedTime}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reason for Visit */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Reason for Visit / Symptoms</label>
              <textarea
                required
                rows={3}
                className="form-textarea"
                placeholder="Briefly describe your consultation needs or primary symptoms..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={submitting}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.3rem', display: 'block' }}>
                * Note: CarePulse is an appointment-management service, not a medical emergency system.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !selectedTime || !selectedDoctorId}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Confirming Booking...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Book Appointment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
