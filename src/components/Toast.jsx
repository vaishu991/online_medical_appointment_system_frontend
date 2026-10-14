import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 100,
        minWidth: '300px',
        maxWidth: '420px',
        backgroundColor: '#ffffff',
        borderLeft: `4px solid ${isError ? '#e11d48' : isSuccess ? '#059669' : '#0284c7'}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-xl)',
        padding: '0.9rem 1.1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      {isSuccess && <CheckCircle2 size={20} color="#059669" />}
      {isError && <AlertCircle size={20} color="#e11d48" />}
      {!isSuccess && !isError && <Info size={20} color="#0284c7" />}

      <div style={{ flex: 1, fontSize: '0.875rem', color: 'var(--slate-800)', fontWeight: 500 }}>
        {toast.message}
      </div>

      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--slate-400)',
          cursor: 'pointer',
          padding: '2px'
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
