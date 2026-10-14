import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import BookingModal from './components/BookingModal';
import Toast from './components/Toast';

// Patient pages
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDirectory from './pages/patient/DoctorDirectory';
import AppointmentHistory from './pages/patient/AppointmentHistory';

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorSchedule from './pages/doctor/DoctorSchedule';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminSpecialties from './pages/admin/AdminSpecialties';
import AdminAppointments from './pages/admin/AdminAppointments';

import { authApi, getToken, setStoredUser } from './api/client';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Modals & Notifications
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingDoctorId, setBookingDoctorId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const initAuth = async () => {
    if (!getToken()) {
      setUser(null);
      setLoadingInitial(false);
      return;
    }

    try {
      const currentUser = await authApi.getCurrentUser();
      setStoredUser(currentUser);
      setUser(currentUser);
    } catch {
      authApi.logout();
      setUser(null);
    } finally {
      setLoadingInitial(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    setActiveTab('dashboard');
    showToast('Signed out successfully.', 'info');
  };

  const handleAuthSuccess = (authUser, welcomeMsg) => {
    setUser(authUser);
    setActiveTab('dashboard');
    showToast(welcomeMsg || 'Authenticated successfully!', 'success');
  };

  const openBookingForDoctor = (doctorId = null) => {
    if (!user) {
      setAuthModalOpen(true);
      showToast('Please sign in or create an account to book.', 'info');
      return;
    }
    setBookingDoctorId(doctorId);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (newAppointment) => {
    showToast(`Appointment booked successfully for ${newAppointment.appointmentDate} at ${newAppointment.appointmentTime}!`, 'success');
    setActiveTab('appointments');
  };

  if (loadingInitial) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 size={40} className="animate-spin" color="var(--primary-600)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--slate-800)' }}>Initializing CarePulse Portal...</h3>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>Connecting to Spring Boot backend on port 8080</p>
        </div>
      </div>
    );
  }

  const role = user?.role || 'GUEST';

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onOpenAuth={() => setAuthModalOpen(true)}

      />

      {/* Main Content Area */}
      <main className="main-wrapper">
        {/* PATIENT ROLE VIEWS */}
        {role === 'PATIENT' && (
          <>
            {activeTab === 'dashboard' && (
              <PatientDashboard
                user={user}
                onNavigate={setActiveTab}
                onOpenBooking={() => openBookingForDoctor(null)}
                showToast={showToast}
              />
            )}

            {activeTab === 'doctors' && (
              <DoctorDirectory
                onSelectDoctorForBooking={(docId) => openBookingForDoctor(docId)}
                showToast={showToast}
              />
            )}

            {activeTab === 'book' && (
              <DoctorDirectory
                onSelectDoctorForBooking={(docId) => openBookingForDoctor(docId)}
                showToast={showToast}
              />
            )}

            {activeTab === 'appointments' && (
              <AppointmentHistory
                onOpenBooking={() => openBookingForDoctor(null)}
                showToast={showToast}
              />
            )}
          </>
        )}

        {/* DOCTOR ROLE VIEWS */}
        {role === 'DOCTOR' && (
          <>
            {activeTab === 'dashboard' && (
              <DoctorDashboard
                user={user}
                onNavigate={setActiveTab}
                showToast={showToast}
              />
            )}

            {activeTab === 'appointments' && (
              <DoctorDashboard
                user={user}
                onNavigate={setActiveTab}
                showToast={showToast}
              />
            )}

            {activeTab === 'schedule' && (
              <DoctorSchedule
                user={user}
                onBack={() => setActiveTab('dashboard')}
                showToast={showToast}
              />
            )}
          </>
        )}

        {/* ADMIN ROLE VIEWS */}
        {role === 'SUPER_ADMIN' && (
          <>
            {activeTab === 'dashboard' && (
              <AdminDashboard
                onNavigate={setActiveTab}
                showToast={showToast}
              />
            )}

            {activeTab === 'doctors' && (
              <AdminDoctors
                showToast={showToast}
              />
            )}

            {activeTab === 'specialties' && (
              <AdminSpecialties
                showToast={showToast}
              />
            )}

            {activeTab === 'appointments' && (
              <AdminAppointments
                showToast={showToast}
              />
            )}
          </>
        )}

        {role === 'ADMIN' && (
          <div className="card empty-state" style={{ padding: '4rem 2rem' }}>
            <div className="empty-state-title" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
              Super administrator access required
            </div>
            <div className="empty-state-text">This account does not have super administrator permissions.</div>
          </div>
        )}
        {/* GUEST VIEW */}
        {role === 'GUEST' && (
          <div className="card empty-state" style={{ padding: '4rem 2rem' }}>
            <div className="empty-state-title" style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
              Welcome to CarePulse Online Medical Appointment System
            </div>
            <div className="empty-state-text" style={{ maxWidth: '480px', marginBottom: '1.5rem' }}>
              Please sign in or create an account to access the medical appointment portal.
            </div>
            <button className="btn btn-primary" onClick={() => setAuthModalOpen(true)}>
              Sign In / Register
            </button>
          </div>
        )}
      </main>

      {/* Floating Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Booking Wizard Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => {
          setBookingModalOpen(false);
          setBookingDoctorId(null);
        }}
        initialDoctorId={bookingDoctorId}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
}
