import React, { useState } from 'react';
import { Send, Zap, FileText, Code } from 'lucide-react';

export default function InputArea({ onSendMessage, isLoading }) {
  const [text, setText] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('auto');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text, selectedSkill);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div style={{
      padding: '16px 24px 20px',
      background: 'var(--bg-surface)',
      borderTop: '1px solid var(--glass-border)'
    }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Controls bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <Zap size={14} color="#8b5cf6" />
            <span>Active Skill Mode:</span>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--glass-border)',
                color: '#fff',
                fontSize: '0.78rem',
                borderRadius: 'var(--radius-sm)',
                padding: '3px 8px',
                outline: 'none'
              }}
            >
              <option value="auto" style={{ background: '#111523' }}>Auto (Grounded Assistant)</option>
              <option value="ship30" style={{ background: '#111523' }}>Ship 30 for 30 Essay Skill (~1,250 words)</option>
              <option value="artifact" style={{ background: '#111523' }}>HTML / Markdown Artifact Generator</option>
            </select>
          </div>
        </div>

        {/* Input box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 12px',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
        }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedSkill === 'ship30'
                ? "Describe the growth topic for your Ship 30 for 30 essay..."
                : selectedSkill === 'artifact'
                ? "Ask for an HTML framework card, PRD template, or visual artifact..."
                : "Ask anything about product strategy, PLG, PMF, or retention..."
            }
            rows={2}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '0.92rem',
              outline: 'none',
              resize: 'none',
              fontFamily: 'var(--font-sans)',
              lineHeight: '1.4'
            }}
          />

          <button
            type="submit"
            className="btn-primary"
            disabled={!text.trim() || isLoading}
            style={{
              padding: '10px 16px',
              opacity: !text.trim() || isLoading ? 0.5 : 1,
              cursor: !text.trim() || isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
