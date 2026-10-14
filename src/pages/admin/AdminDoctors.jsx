import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Plus,
  Search,
  Edit2,
  CheckCircle,
  XCircle,
  Loader2,
  
  Award,
  X
} from 'lucide-react';
import { doctorsApi, specialtiesApi } from '../../api/client';
import { formatINR } from '../../utils/formatINR';

export default function AdminDoctors({ showToast }) {
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [consultationFee, setConsultationFee] = useState('100.00');
  const [bio, setBio] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docsData, specsData] = await Promise.all([
        doctorsApi.getAll({ includeInactive: true }),
        specialtiesApi.getAll()
      ]);
      setDoctors(docsData || []);
      setSpecialties(specsData || []);
      if (specsData?.length > 0 && !specialtyId) {
        setSpecialtyId(specsData[0].id);
      }
    } catch (err) {
      showToast('Failed to load doctors list.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setFullName('');
    setEmail('');
    setPassword('doctor123');
    setPhone('');
    setSpecialtyId(specialties[0]?.id || '');
    setQualification('MD, Internal Medicine');
    setExperienceYears('5');
    setConsultationFee('100.00');
    setBio('');
    setRoomNumber('Suite 201');
    setModalOpen(true);
  };

  const handleOpenEdit = (doc) => {
    setIsEditing(true);
    setEditingId(doc.id);
    setFullName(doc.fullName);
    setEmail(doc.email);
    setPassword('');
    setPhone(doc.phone || '');
    setSpecialtyId(doc.specialtyId);
    setQualification(doc.qualification || '');
    setExperienceYears(String(doc.experienceYears || '0'));
    setConsultationFee(String(doc.consultationFee || '0'));
    setBio(doc.bio || '');
    setRoomNumber(doc.roomNumber || '');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        fullName,
        email,
        phone,
        specialtyId: Number(specialtyId),
        qualification,
        experienceYears: Number(experienceYears),
        consultationFee: Number(consultationFee),
        bio,
        roomNumber
      };

      if (!isEditing) {
        payload.password = password || 'doctor123';
        await doctorsApi.create(payload);
        showToast('New doctor added successfully!', 'success');
      } else {
        await doctorsApi.update(editingId, payload);
        showToast('Doctor profile updated successfully!', 'success');
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to save doctor.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (docId, currentActive) => {
    try {
      await doctorsApi.toggleStatus(docId);
      showToast(`Doctor profile marked as ${currentActive ? 'Inactive' : 'Active'}.`, 'success');
      loadData();
    } catch (err) {
      showToast(err.message || 'Failed to change doctor status.', 'error');
    }
  };

  const filteredDoctors = doctors.filter((d) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.fullName?.toLowerCase().includes(term) ||
      d.specialtyName?.toLowerCase().includes(term) ||
      d.email?.toLowerCase().includes(term) ||
      d.qualification?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
            Doctor Profiles & Staff Management
          </h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Register new physicians, update credentials, adjust consultation rates, and toggle availability.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add New Doctor
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            color="var(--slate-400)"
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder="Search doctors by name, specialty, or qualification..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Doctors Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Loader2 size={32} className="animate-spin" color="var(--primary-600)" style={{ margin: '0 auto 0.75rem' }} />
            <div style={{ color: 'var(--slate-600)' }}>Loading doctors...</div>
          </div>
        ) : filteredDoctors.length > 0 ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Physician</th>
                  <th>Specialty</th>
                  <th>Qualification</th>
                  <th>Experience</th>
                  <th>Fee</th>
                  <th>Room</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--slate-900)' }}>{doc.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{doc.email}</div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--primary-800)', background: 'var(--primary-50)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
                        {doc.specialtyName}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.825rem' }}>{doc.qualification}</td>
                    <td style={{ fontSize: '0.825rem' }}>{doc.experienceYears} years</td>
                    <td>
                      <strong style={{ color: 'var(--slate-900)' }}>{formatINR(doc.consultationFee)}</strong>
                    </td>
                    <td style={{ fontSize: '0.825rem' }}>{doc.roomNumber || '—'}</td>
                    <td>
                      <span
                        className={`status-pill ${doc.active ? 'CONFIRMED' : 'CANCELLED'}`}
                        style={{ fontSize: '0.7rem' }}
                      >
                        {doc.active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenEdit(doc)}
                          title="Edit Profile"
                        >
                          <Edit2 size={13} /> Edit
                        </button>

                        <button
                          className="btn btn-secondary btn-sm"
                          style={{
                            color: doc.active ? '#be123c' : '#059669',
                            borderColor: doc.active ? '#fecdd3' : '#a7f3d0'
                          }}
                          onClick={() => handleToggleStatus(doc.id, doc.active)}
                          title={doc.active ? 'Deactivate doctor' : 'Activate doctor'}
                        >
                          {doc.active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">No doctors found</div>
            <div className="empty-state-text">No physician profiles matched your query.</div>
          </div>
        )}
      </div>

      {/* Add / Edit Doctor Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                {isEditing ? 'Edit Physician Profile' : 'Add New Physician'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Dr. Robert Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      required
                      disabled={isEditing}
                      className="form-input"
                      placeholder="physician@carepulse.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  {!isEditing && (
                    <div className="form-group">
                      <label className="form-label">Temporary Password</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  )}

                  {isEditing && (
                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="+1 555-0100"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Specialty</label>
                    <select
                      className="form-select"
                      value={specialtyId}
                      onChange={(e) => setSpecialtyId(e.target.value)}
                      required
                    >
                      {specialties.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Consultation Fee (INR)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="form-input"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label className="form-label">Qualification / Degrees</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. MD, Board Certified"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Experience (Years)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Clinic / Room Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Suite 305"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Physician Biography</label>
                  <textarea
                    rows={2}
                    className="form-textarea"
                    placeholder="Professional background, focus areas, patient philosophy..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
