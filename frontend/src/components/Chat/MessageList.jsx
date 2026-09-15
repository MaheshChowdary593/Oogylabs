import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function MessageList({ messages, isLoading, onPromptChipClick, onOpenArtifact }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const samplePrompts = [
    { label: "B2B PLG & Growth Loops", text: "What are Elena Verna's key growth loops for B2B PLG?" },
    { label: "Four Fits Framework", text: "Explain Brian Balfour's Four Fits Framework for scaling startups." },
    { label: "Ship 30 Essay on Retention", text: "Write a Ship 30 for 30 essay on retention and activation curves based on Casey Winters." },
    { label: "HTML Growth Experiment Card", text: "Generate an HTML growth experiment tracking dashboard card artifact." }
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {messages.length === 0 ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sparkles size={32} color="white" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '10px' }}>
            Lenny Growth Assistant
          </h2>
          <p style={{ maxWidth: '480px', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '30px' }}>
            Ask questions grounded strictly in transcripts from top product and growth experts like Elena Verna, Brian Balfour, Shreyas Doshi, and Rahul Vohra.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', maxWidth: '640px', width: '100%' }}>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                className="btn-secondary"
                onClick={() => onPromptChipClick(p.text)}
                style={{
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.03)'
                }}
              >
                <span style={{ fontSize: '0.78rem', color: '#a855f7', fontWeight: 700 }}>{p.label}</span>
                <span style={{ fontSize: '0.86rem', color: '#e5e7eb', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {p.text}
                  <ArrowRight size={14} color="#6b7280" />
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {messages.map((m, idx) => (
            <MessageItem key={m.id || idx} message={m} onOpenArtifact={onOpenArtifact} />
          ))}

          {isLoading && (
            <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px', color: '#c4b5fd', fontSize: '0.88rem' }}>
              <div style={{
                width: '12px', height: '12px', borderRadius: '50%',
                background: '#8b5cf6', animation: 'pulse-dot 1s infinite'
              }} />
              <span>Analyzing transcripts & synthesizing response...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}
