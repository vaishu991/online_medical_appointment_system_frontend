import React, { useState, useEffect } from 'react';
import {
  Users,
  Stethoscope,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Layers,
  ArrowRight,
  Shield,
  Loader2,
  Plus
} from 'lucide-react';
import { dashboardApi } from '../../api/client';

export default function AdminDashboard({ onNavigate, showToast }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await dashboardApi.getAdmin();
      setDashboard(data);
    } catch (err) {
      showToast('Failed to load administrator metrics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <Loader2 size={36} className="animate-spin" color="var(--primary-600)" style={{ margin: '0 auto 1rem' }} />
        <div style={{ color: 'var(--slate-600)' }}>Loading system analytics...</div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Admin Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064e3b, #0f766e)',
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
            System Administration
          </span>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem', letterSpacing: '-0.02em' }}>
            CarePulse Clinical Operations Hub
          </h1>
          <p style={{ opacity: 0.9, fontSize: '0.95rem', maxWidth: '540px', marginTop: '0.35rem' }}>
            Comprehensive overview of patient volume, credentialed medical staff, appointment bookings, and department specialties.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            style={{ background: '#ffffff', color: 'var(--primary-900)' }}
            onClick={() => onNavigate('doctors')}
          >
            <Stethoscope size={16} color="#047857" /> Manage Doctors
          </button>
          <button
            className="btn btn-secondary"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}
            onClick={() => onNavigate('specialties')}
          >
            <Layers size={16} /> Manage Specialties
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <div className="stat-label">Total Patients</div>
            <div className="stat-value">{dashboard?.totalPatients || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-700)' }}>
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Active Doctors</div>
            <div className="stat-value">{dashboard?.totalDoctors || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <Stethoscope size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Total Appointments</div>
            <div className="stat-value">{dashboard?.totalAppointments || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--slate-100)', color: 'var(--slate-700)' }}>
            <Calendar size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Pending Approval</div>
            <div className="stat-value" style={{ color: '#b45309' }}>{dashboard?.pendingAppointments || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
            <Clock size={22} />
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div>
            <div className="stat-label">Confirmed Upcoming</div>
            <div className="stat-value" style={{ color: '#047857' }}>{dashboard?.confirmedAppointments || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#d1fae5', color: '#065f46' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Completed Consults</div>
            <div className="stat-value">{dashboard?.completedAppointments || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Cancelled Visits</div>
            <div className="stat-value" style={{ color: '#be123c' }}>{dashboard?.cancelledAppointments || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: '#ffe4e6', color: '#9f1239' }}>
            <XCircle size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div>
            <div className="stat-label">Clinical Specialties</div>
            <div className="stat-value">{dashboard?.totalSpecialties || 0}</div>
          </div>
          <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-700)' }}>
            <Layers size={22} />
          </div>
        </div>
      </div>

      {/* Recent System Activity Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <Calendar size={20} color="var(--primary-600)" /> Recent Patient Bookings
            </div>
            <div className="card-subtitle">Real-time appointments booked across all hospital departments</div>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('appointments')}>
            View All Records <ArrowRight size={14} />
          </button>
        </div>

        {dashboard?.recentAppointments?.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Patient</th>
                  <th>Physician</th>
                  <th>Specialty</th>
                  <th>Date & Time</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recentAppointments.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--slate-700)' }}>#{app.id}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{app.patientName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{app.patientEmail}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{app.doctorName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{app.roomNumber}</div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.825rem', color: 'var(--primary-800)', fontWeight: 600 }}>
                        {app.specialtyName}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{app.appointmentDate}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{app.appointmentTime}</div>
                    </td>
                    <td style={{ maxWidth: '240px', fontSize: '0.825rem' }}>
                      {app.reason}
                    </td>
                    <td>
                      <span className={`status-pill ${app.status}`}>{app.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
            <div className="empty-state-title">No appointments found</div>
            <div className="empty-state-text">Appointments booked by patients will appear here.</div>
          </div>
        )}
      </div>
    </div>
  );
}
