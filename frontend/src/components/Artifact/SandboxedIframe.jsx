import React, { useMemo } from 'react';

export default function SandboxedIframe({ htmlContent, title = "Artifact Preview" }) {
  const srcDoc = useMemo(() => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
              background-color: #0d0f17;
              color: #f3f4f6;
              padding: 20px;
              margin: 0;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;
  }, [htmlContent]);

  return (
    <iframe
      title={title}
      srcDoc={srcDoc}
      sandbox="allow-scripts"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        background: '#0d0f17'
      }}
    />
  );
}
