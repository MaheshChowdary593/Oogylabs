import React, { useState } from 'react';
import { BookOpen, ExternalLink, X } from 'lucide-react';

export default function CitationBadge({ citation }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(6, 182, 212, 0.12)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          color: '#22d3ee',
          fontSize: '0.75rem',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)',
          cursor: 'pointer',
          margin: '0 4px',
          verticalAlign: 'middle',
          transition: 'all 0.2s ease'
        }}
        title={`View transcript excerpt for ${citation.guest}`}
      >
        <BookOpen size={12} />
        {citation.guest}
      </button>

      {/* Transcript Detail Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '540px',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            background: '#111523',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {citation.topic || 'Lenny Podcast Transcript'}
                </span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '4px', color: '#fff' }}>
                  {citation.episode_title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Guest: <strong>{citation.guest}</strong> {citation.part && `• ${citation.part}`}
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              fontSize: '0.88rem',
              lineHeight: 1.6,
              color: '#d1d5db',
              maxHeight: '200px',
              overflowY: 'auto',
              marginBottom: '16px'
            }}>
              "{citation.snippet}"
            </div>

            {citation.source_url && (
              <a
                href={citation.source_url}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{ fontSize: '0.82rem', textDecoration: 'none', justifyContent: 'center' }}
              >
                View Full Transcript on Lenny's Podcast
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
