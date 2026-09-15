import React from 'react';
import { Sparkles, Cpu, Plus, Layers, FileText } from 'lucide-react';

export default function Header({ 
  selectedProvider, 
  setSelectedProvider, 
  modelsInfo, 
  onNewSession,
  activeArtifact,
  toggleArtifactViewer,
  onTriggerSkill
}) {
  const currentProvider = modelsInfo?.providers?.find(p => p.id === selectedProvider) || modelsInfo?.providers?.[0];
  const isOnline = currentProvider?.available ?? true;

  return (
    <header className="glass-panel" style={{
      height: '64px',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--glass-border)',
      zIndex: 20
    }}>
      {/* Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'var(--primary-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-glow)'
        }}>
          <Sparkles size={20} color="white" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            The Lenny Growth Assistant
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Grounded Product & Growth Intelligence
          </p>
        </div>
      </div>

      {/* Model Selector & Quick Skill Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Quick Skill Pill */}
        <button 
          className="btn-secondary" 
          onClick={() => onTriggerSkill('ship30')}
          title="Generate Ship 30 for 30 Longform Essay"
          style={{ fontSize: '0.82rem', padding: '6px 12px' }}
        >
          <FileText size={15} color="#a855f7" />
          Ship 30 Essay
        </button>

        {/* Model Toggle Dropdown */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)',
          padding: '4px 10px'
        }}>
          <Cpu size={16} color="#06b6d4" />
          <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {modelsInfo?.providers?.map((p) => (
              <option key={p.id} value={p.id} style={{ background: '#111523', color: '#fff' }}>
                {p.name} {p.available ? '' : '(Unavailable)'}
              </option>
            ))}
          </select>
        </div>

        {/* Artifact Viewer Drawer Toggle Button */}
        {activeArtifact && (
          <button 
            className="btn-secondary"
            onClick={toggleArtifactViewer}
            style={{
              background: 'rgba(139, 92, 246, 0.15)',
              borderColor: 'rgba(139, 92, 246, 0.4)',
              color: '#c4b5fd'
            }}
          >
            <Layers size={16} />
            Artifact Viewer
          </button>
        )}

        {/* New Session Button */}
        <button className="btn-primary" onClick={onNewSession}>
          <Plus size={16} />
          New Chat
        </button>
      </div>
    </header>
  );
}
