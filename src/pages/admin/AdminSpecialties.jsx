import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  X,
  Stethoscope,
  Heart,
  Baby,
  Activity,
  Sparkles,
  Brain
} from 'lucide-react';
import { specialtiesApi } from '../../api/client';

export default function AdminSpecialties({ showToast }) {
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Activity');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSpecialties();
  }, []);

  const loadSpecialties = async () => {
    setLoading(true);
    try {
      const data = await specialtiesApi.getAll();
      setSpecialties(data || []);
    } catch (err) {
      showToast('Failed to load specialties.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setEditingId(null);
    setName('');
    setDescription('');
    setIcon('Activity');
    setModalOpen(true);
  };

  const handleOpenEdit = (spec) => {
    setIsEditing(true);
    setEditingId(spec.id);
    setName(spec.name);
    setDescription(spec.description || '');
    setIcon(spec.icon || 'Activity');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEditing) {
        await specialtiesApi.update(editingId, { name, description, icon });
        showToast('Specialty updated successfully!', 'success');
      } else {
        await specialtiesApi.create({ name, description, icon });
        showToast('New medical specialty created!', 'success');
      }
      setModalOpen(false);
      loadSpecialties();
    } catch (err) {
      showToast(err.message || 'Failed to save specialty.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (spec) => {
    if (spec.doctorCount > 0) {
      showToast(`Cannot delete "${spec.name}" because it has ${spec.doctorCount} assigned doctors.`, 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${spec.name}"?`)) {
      return;
    }

    try {
      await specialtiesApi.delete(spec.id);
      showToast(`Specialty "${spec.name}" deleted.`, 'success');
      loadSpecialties();
    } catch (err) {
      showToast(err.message || 'Failed to delete specialty.', 'error');
    }
  };

  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'Heart': return <Heart size={20} />;
      case 'Baby': return <Baby size={20} />;
      case 'Sparkles': return <Sparkles size={20} />;
      case 'Brain': return <Brain size={20} />;
      case 'Stethoscope': return <Stethoscope size={20} />;
      default: return <Activity size={20} />;
    }
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--slate-900)', letterSpacing: '-0.02em' }}>
            Medical Specialties & Clinical Departments
          </h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
            Configure clinical practice specialties and department categories for physician assignment.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenAdd}>
          <Plus size={16} /> Add Specialty
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Loader2 size={32} className="animate-spin" color="var(--primary-600)" style={{ margin: '0 auto 0.75rem' }} />
            <div style={{ color: 'var(--slate-600)' }}>Loading specialties...</div>
          </div>
        ) : specialties.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {specialties.map((spec) => (
              <div
                key={spec.id}
                style={{
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div
                      style={{
                        width: '2.5rem',
                        height: '2.5rem',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--primary-50)',
                        color: 'var(--primary-700)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {renderIcon(spec.icon)}
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--slate-600)',
                        background: 'var(--slate-100)',
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-full)'
                      }}
                    >
                      {spec.doctorCount || 0} Physicians
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--slate-900)', marginBottom: '0.4rem' }}>
                    {spec.name}
                  </h3>

                  <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
                    {spec.description || 'Specialized clinical care and consulting.'}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--slate-100)' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(spec)}>
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#be123c', borderColor: '#fecdd3' }}
                    onClick={() => handleDelete(spec)}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-title">No specialties configured</div>
            <div className="empty-state-text">Create medical specialties to organize physician departments.</div>
          </div>
        )}
      </div>

      {/* Add / Edit Specialty Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--slate-900)' }}>
                {isEditing ? 'Edit Specialty' : 'Add Medical Specialty'}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Specialty Name</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Ophthalmology"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Icon / Category Symbol</label>
                  <select className="form-select" value={icon} onChange={(e) => setIcon(e.target.value)}>
                    <option value="Activity">General Clinical (Activity)</option>
                    <option value="Heart">Heart & Cardio (Heart)</option>
                    <option value="Baby">Pediatrics & Maternity (Baby)</option>
                    <option value="Sparkles">Dermatology & Skin (Sparkles)</option>
                    <option value="Brain">Neurology & Cognitive (Brain)</option>
                    <option value="Stethoscope">Primary Care (Stethoscope)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Description</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="Clinical scope, diagnostic evaluations, treatments..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Specialty'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
