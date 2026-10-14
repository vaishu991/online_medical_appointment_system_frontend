import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Stethoscope,
  Calendar,
  IndianRupee,
  Award,
  MapPin,
  Clock,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { doctorsApi, specialtiesApi } from '../../api/client';
import { formatINR } from '../../utils/formatINR';

export default function DoctorDirectory({ onSelectDoctorForBooking, showToast }) {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsData, specsData] = await Promise.all([
        doctorsApi.getAll(),
        specialtiesApi.getAll()
      ]);
      setDoctors(docsData || []);
      setSpecialties(specsData || []);
    } catch (err) {
      showToast('Failed to load doctors and specialties.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await doctorsApi.getAll({
        search: searchTerm,
        specialtyId: selectedSpecialtyId || null
      });
      setDoctors(data || []);
    } catch (err) {
      showToast('Search query failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialtyFilter = async (specId) => {
    const newSpecId = selectedSpecialtyId === String(specId) ? '' : String(specId);
    setSelectedSpecialtyId(newSpecId);
    setLoading(true);
    try {
      const data = await doctorsApi.getAll({
        search: searchTerm,
        specialtyId: newSpecId || null
      });
      setDoctors(data || []);
    } catch (err) {
      showToast('Filter query failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
          Find Healthcare Specialists
        </h1>
        <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Explore our certified board physicians across clinical specialties, check consulting rates, and book appointments.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ marginBottom: '1.75rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <Search
              size={18}
              color="var(--slate-400)"
              style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search by physician name, specialty, or qualification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary">
            <Search size={16} /> Search
          </button>

          {(searchTerm || selectedSpecialtyId) && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialtyId('');
                loadData();
              }}
            >
              Reset Filters
            </button>
          )}
        </form>

        {/* Specialty Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '1rem', borderTop: '1px solid var(--slate-100)', paddingTop: '1rem' }}>
          <button
            className={`btn btn-sm ${!selectedSpecialtyId ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleSpecialtyFilter('')}
          >
            All Specialties ({specialties.reduce((acc, s) => acc + (s.doctorCount || 0), 0)})
          </button>

          {specialties.map((spec) => {
            const isSelected = selectedSpecialtyId === String(spec.id);
            return (
              <button
                key={spec.id}
                className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => handleSpecialtyFilter(spec.id)}
              >
                {spec.name} ({spec.doctorCount || 0})
              </button>
            );
          })}
        </div>
      </div>

      {/* Doctors Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
          <Loader2 size={36} className="animate-spin" color="var(--primary-600)" style={{ margin: '0 auto 1rem' }} />
          <div style={{ color: 'var(--slate-600)' }}>Finding doctors...</div>
        </div>
      ) : doctors.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {doctors.map((doc) => (
            <div key={doc.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                  <div
                    style={{
                      width: '3.5rem',
                      height: '3.5rem',
                      borderRadius: 'var(--radius-lg)',
                      background: 'linear-gradient(135deg, var(--primary-100), var(--primary-200))',
                      color: 'var(--primary-800)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.25rem',
                      flexShrink: 0
                    }}
                  >
                    <Stethoscope size={24} />
                  </div>

                  <div>
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        color: 'var(--primary-800)',
                        background: 'var(--primary-50)',
                        border: '1px solid var(--primary-200)',
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        marginBottom: '0.25rem'
                      }}
                    >
                      {doc.specialtyName}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                      {doc.fullName}
                    </h3>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '0.1rem' }}>
                      {doc.qualification}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                  {doc.bio || 'Dedicated medical practitioner focused on providing quality healthcare to every patient.'}
                </p>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    background: 'var(--slate-50)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--slate-200)',
                    marginBottom: '1.25rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                    <Award size={16} color="var(--primary-600)" />
                    <span>{doc.experienceYears ? `${doc.experienceYears} yrs experience` : 'Experienced'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                    <MapPin size={16} color="var(--primary-600)" />
                    <span>{doc.roomNumber || 'Clinic Room'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--slate-600)' }}>
                    <Clock size={16} color="var(--primary-600)" />
                    <span>Mon - Fri (Weekly)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--primary-600)' }}>
                    <IndianRupee size={16} color="var(--primary-600)" />
                    <strong>{formatINR(doc.consultationFee)} fee</strong>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => onSelectDoctorForBooking(doc.id)}
              >
                <Calendar size={16} /> Book Appointment
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card empty-state">
          <div className="empty-state-icon">
            <Search size={28} />
          </div>
          <div className="empty-state-title">No doctors found</div>
          <div className="empty-state-text">
            No doctors matched your search criteria. Try a different search query or select another specialty.
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setSearchTerm('');
              setSelectedSpecialtyId('');
              loadData();
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
