import React from 'react';
import { MessageSquare, Trash2, ChevronLeft, ChevronRight, Compass } from 'lucide-react';

export default function Sidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  isOpen,
  setIsOpen
}) {
  if (!isOpen) {
    return (
      <div style={{
        width: '50px',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--glass-border)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '16px',
        gap: '16px'
      }}>
        <button 
          className="btn-secondary" 
          onClick={() => setIsOpen(true)}
          style={{ padding: '8px' }}
          title="Expand Conversations"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <aside className="glass-panel" style={{
      width: '260px',
      borderRight: '1px solid var(--glass-border)',
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 64px)',
      background: 'var(--bg-surface)'
    }}>
      {/* Sidebar Header */}
      <div style={{
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--glass-border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          <Compass size={16} color="#8b5cf6" />
          Growth History
        </div>
        <button 
          className="btn-secondary" 
          onClick={() => setIsOpen(false)}
          style={{ padding: '4px' }}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Session List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        {sessions.length === 0 ? (
          <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.82rem' }}>
            No prior conversations found. Start a new topic!
          </div>
        ) : (
          sessions.map((s) => {
            const isSelected = s.id === currentSessionId;
            return (
              <div
                key={s.id}
                onClick={() => onSelectSession(s.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  border: isSelected ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                  color: isSelected ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.85rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                  <MessageSquare size={15} color={isSelected ? '#c4b5fd' : '#6b7280'} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.title || 'Growth Session'}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(s.id);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    opacity: isSelected ? 0.8 : 0.4,
                    padding: '2px'
                  }}
                  title="Delete session"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
