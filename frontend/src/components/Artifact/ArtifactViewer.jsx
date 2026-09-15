import React, { useState } from 'react';
import { marked } from 'marked';
import { X, Eye, Code, Copy, Download, Check } from 'lucide-react';
import SandboxedIframe from './SandboxedIframe';

export default function ArtifactViewer({ artifact, onClose }) {
  const [activeTab, setActiveTab] = useState('preview'); // preview | code
  const [copied, setCopied] = useState(false);

  if (!artifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = artifact.artifact_type === 'html' ? 'html' : 'md';
    const blob = new Blob([artifact.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${artifact.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
    link.click();
  };

  return (
    <aside className="glass-panel" style={{
      width: '520px',
      height: 'calc(100vh - 64px)',
      borderLeft: '1px solid var(--glass-border)',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-surface)',
      zIndex: 30
    }}>
      {/* Artifact Viewer Header */}
      <div style={{
        padding: '14px 20px',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: '4px',
            background: artifact.artifact_type === 'html' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(168, 85, 247, 0.2)',
            color: artifact.artifact_type === 'html' ? '#06b6d4' : '#c4b5fd',
            textTransform: 'uppercase'
          }}>
            {artifact.artifact_type}
          </span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {artifact.title}
          </h3>
        </div>

        <button 
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Toolbar & Tab Controls */}
      <div style={{
        padding: '10px 20px',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.02)'
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(0,0,0,0.3)', padding: '3px', borderRadius: 'var(--radius-sm)' }}>
          <button
            onClick={() => setActiveTab('preview')}
            style={{
              background: activeTab === 'preview' ? 'var(--primary-gradient)' : 'transparent',
              border: 'none',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Eye size={14} /> Preview
          </button>
          <button
            onClick={() => setActiveTab('code')}
            style={{
              background: activeTab === 'code' ? 'var(--primary-gradient)' : 'transparent',
              border: 'none',
              color: '#fff',
              padding: '4px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Code size={14} /> Code
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={handleCopy} style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button className="btn-secondary" onClick={handleDownload} style={{ padding: '6px 10px', fontSize: '0.78rem' }}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div style={{ flex: 1, overflow: 'hidden', padding: '16px', background: '#090b11' }}>
        {activeTab === 'preview' ? (
          artifact.artifact_type === 'html' ? (
            <SandboxedIframe htmlContent={artifact.content} title={artifact.title} />
          ) : (
            <div 
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: marked.parse(artifact.content) }}
              style={{
                height: '100%',
                overflowY: 'auto',
                padding: '16px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--glass-border)'
              }}
            />
          )
        ) : (
          <pre style={{
            height: '100%',
            overflow: 'auto',
            padding: '16px',
            background: '#0d0f17',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border)',
            color: '#a7f3d0',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            lineHeight: 1.5
          }}>
            <code>{artifact.content}</code>
          </pre>
        )}
      </div>
    </aside>
  );
}
