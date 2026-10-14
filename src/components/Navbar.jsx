import React from 'react';
import {
  Stethoscope,
  Calendar,
  User,
  LogOut,
  Shield,
  Activity,
  Layers,
  Clock,
  Search,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenAuth,
}) {
  const role = user?.role || 'GUEST';

  return (
    <>
      {/* Main Navigation */}
      <header className="navbar">
        <div className="navbar-inner">
          <div className="brand-logo" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
            <div className="brand-icon-box">
              <Stethoscope size={22} strokeWidth={2.5} />
            </div>
            <div>
              <span>CarePulse</span>
              <span className="brand-tagline">Medical Appointments</span>
            </div>
          </div>

          {/* Navigation Links based on role */}
          <nav className="nav-links">
            {role === 'PATIENT' && (
              <>
                <button
                  className={`nav-link-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <Activity size={17} /> Dashboard
                </button>
                <button
                  className={`nav-link-btn ${activeTab === 'doctors' ? 'active' : ''}`}
                  onClick={() => setActiveTab('doctors')}
                >
                  <Search size={17} /> Find Doctors
                </button>
                <button
                  className={`nav-link-btn ${activeTab === 'book' ? 'active' : ''}`}
                  onClick={() => setActiveTab('book')}
                >
                  <Calendar size={17} /> Book Appointment
                </button>
                <button
                  className={`nav-link-btn ${activeTab === 'appointments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('appointments')}
                >
                  <Clock size={17} /> My Bookings
                </button>
              </>
            )}

            {role === 'DOCTOR' && (
              <>
                <button
                  className={`nav-link-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <Activity size={17} /> Doctor Dashboard
                </button>
                <button
                  className={`nav-link-btn ${activeTab === 'appointments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('appointments')}
                >
                  <Calendar size={17} /> Appointments
                </button>
                <button
                  className={`nav-link-btn ${activeTab === 'schedule' ? 'active' : ''}`}
                  onClick={() => setActiveTab('schedule')}
                >
                  <Clock size={17} /> Working Hours
                </button>
              </>
            )}

            {role === 'SUPER_ADMIN' && (
              <>
                <button
                  className={`nav-link-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <Activity size={17} /> Super Admin Overview
                </button>
                <button
                  className={`nav-link-btn ${activeTab === 'doctors' ? 'active' : ''}`}
                  onClick={() => setActiveTab('doctors')}
                >
                  <Users size={17} /> Doctors
                </button>
                <button
                  className={`nav-link-btn ${activeTab === 'specialties' ? 'active' : ''}`}
                  onClick={() => setActiveTab('specialties')}
                >
                  <Layers size={17} /> Specialties
                </button>
                <button
                  className={`nav-link-btn ${activeTab === 'appointments' ? 'active' : ''}`}
                  onClick={() => setActiveTab('appointments')}
                >
                  <Calendar size={17} /> All Appointments
                </button>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="user-menu-group">
            {user ? (
              <>
                <span className={`role-badge ${user.role.toLowerCase()}`}>
                  {user.role === 'SUPER_ADMIN' && <Shield size={12} />}
                  {user.role === 'DOCTOR' && <Stethoscope size={12} />}
                  {user.role === 'PATIENT' && <User size={12} />}
                  {user.role}
                </span>

                <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                    {user.fullName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                    {user.email}
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={onLogout}
                  title="Sign out"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                >
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={onOpenAuth}>
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
