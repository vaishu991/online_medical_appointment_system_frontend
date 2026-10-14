import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle2, Save, Loader2, ArrowLeft } from 'lucide-react';
import { doctorsApi } from '../../api/client';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function DoctorSchedule({ user, onBack, showToast }) {
  const [doctorId, setDoctorId] = useState(user?.doctorId || null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    initSchedule();
  }, [user]);

  const initSchedule = async () => {
    setLoading(true);
    try {
      let docId = user?.doctorId;
      if (!docId) {
        // Fallback: lookup doctor by email or get first doctor
        const allDocs = await doctorsApi.getAll();
        const found = allDocs.find((d) => d.email === user?.email) || allDocs[0];
        if (found) {
          docId = found.id;
          setDoctorId(found.id);
        }
      }

      if (docId) {
        const data = await doctorsApi.getAvailability(docId);
        // Normalize 7 days
        const normalized = DAYS.map((day) => {
          const existing = (data || []).find((s) => s.dayOfWeek === day);
          if (existing) {
            return {
              ...existing,
              startTime: existing.startTime ? existing.startTime.substring(0, 5) : '09:00',
              endTime: existing.endTime ? existing.endTime.substring(0, 5) : '17:00',
              active: existing.active ?? true,
              slotDurationMinutes: existing.slotDurationMinutes || 30
            };
          }
          return {
            dayOfWeek: day,
            startTime: '09:00',
            endTime: '17:00',
            slotDurationMinutes: 30,
            active: day !== 'SATURDAY' && day !== 'SUNDAY'
          };
        });
        setSchedule(normalized);
      }
    } catch (err) {
      showToast('Could not load doctor working schedule.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (index, field, value) => {
    const updated = [...schedule];
    updated[index] = { ...updated[index], [field]: value };
    setSchedule(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!doctorId) {
      showToast('Doctor profile identification not found.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = schedule.map((item) => ({
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime.length === 5 ? `${item.startTime}:00` : item.startTime,
        endTime: item.endTime.length === 5 ? `${item.endTime}:00` : item.endTime,
        slotDurationMinutes: parseInt(item.slotDurationMinutes, 10) || 30,
        active: item.active
      }));

      await doctorsApi.updateAvailability(doctorId, payload);
      showToast('Weekly practice hours saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save schedule.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <Loader2 size={36} className="animate-spin" color="var(--primary-600)" style={{ margin: '0 auto 1rem' }} />
        <div style={{ color: 'var(--slate-600)' }}>Loading working hours...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onBack}
            style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
            Weekly Practice Hours & Slot Configuration
          </h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Define the days you are available for consultations, shift start/end times, and slot duration intervals.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 size={16} className="animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save size={16} /> Save Working Hours
            </>
          )}
        </button>
      </div>

      <div className="card">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {schedule.map((item, index) => (
            <div
              key={item.dayOfWeek}
              style={{
                padding: '1.15rem 1.25rem',
                border: '1px solid var(--slate-200)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                background: item.active ? '#ffffff' : 'var(--slate-50)',
                opacity: item.active ? 1 : 0.65
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '180px' }}>
                <input
                  type="checkbox"
                  id={`chk-${item.dayOfWeek}`}
                  checked={item.active}
                  onChange={(e) => handleDayChange(index, 'active', e.target.checked)}
                  style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--primary-600)', cursor: 'pointer' }}
                />
                <label
                  htmlFor={`chk-${item.dayOfWeek}`}
                  style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-800)', cursor: 'pointer' }}
                >
                  {item.dayOfWeek.charAt(0) + item.dayOfWeek.slice(1).toLowerCase()}
                </label>
              </div>

              {item.active ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>Start Time:</span>
                    <input
                      type="time"
                      className="form-input"
                      style={{ width: '130px', padding: '0.4rem 0.6rem' }}
                      value={item.startTime}
                      onChange={(e) => handleDayChange(index, 'startTime', e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>End Time:</span>
                    <input
                      type="time"
                      className="form-input"
                      style={{ width: '130px', padding: '0.4rem 0.6rem' }}
                      value={item.endTime}
                      onChange={(e) => handleDayChange(index, 'endTime', e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>Slot Interval:</span>
                    <select
                      className="form-select"
                      style={{ width: '130px', padding: '0.4rem 0.6rem' }}
                      value={item.slotDurationMinutes}
                      onChange={(e) => handleDayChange(index, 'slotDurationMinutes', e.target.value)}
                    >
                      <option value="15">15 mins</option>
                      <option value="20">20 mins</option>
                      <option value="30">30 mins</option>
                      <option value="45">45 mins</option>
                      <option value="60">60 mins</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--slate-400)', fontStyle: 'italic' }}>
                  Clinic Closed / Off Duty
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--slate-200)' }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Practice Hours'}
          </button>
        </div>
      </div>
    </div>
  );
}
