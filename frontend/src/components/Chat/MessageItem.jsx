import React from 'react';
import { marked } from 'marked';
import { Bot, User, Layers } from 'lucide-react';
import CitationBadge from './CitationBadge';

export default function MessageItem({ message, onOpenArtifact }) {
  const isUser = message.role === 'user';
  
  // Render html from markdown safely
  const htmlContent = marked.parse(message.content || '');

  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      padding: '20px 24px',
      background: isUser ? 'transparent' : 'rgba(22, 28, 45, 0.4)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      animation: 'fadeIn 0.2s ease-in'
    }}>
      {/* Avatar */}
      <div style={{
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        background: isUser ? 'var(--secondary-gradient)' : 'var(--primary-gradient)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {isUser ? <User size={18} color="white" /> : <Bot size={18} color="white" />}
      </div>

      {/* Message Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.8rem',
          fontWeight: 700,
          color: isUser ? '#38bdf8' : '#c4b5fd',
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {isUser ? 'Product Leader' : 'The Lenny Assistant'}
        </div>

        {/* Render Markdown Content */}
        <div 
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
          style={{ fontSize: '0.92rem', lineHeight: 1.65, color: '#e5e7eb' }}
        />

        {/* Render Grounding Citation Badges */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div style={{
            marginTop: '14px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '6px'
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontWeight: 600 }}>
              Grounding Transcripts:
            </span>
            {message.citations.map((c, i) => (
              <CitationBadge key={i} citation={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
