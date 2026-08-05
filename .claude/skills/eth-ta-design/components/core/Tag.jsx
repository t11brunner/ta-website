import React from 'react';

export function Tag({ children, tone = 'accent' }) {
  const tones = {
    accent: { color: 'var(--accent)', background: 'var(--accent-soft)' },
    dim: { color: 'var(--text-muted)', background: 'var(--surface-alt)' },
  };
  return (
    <span style={{
      fontFamily: 'var(--f-mono)', fontSize: 10, color: tones[tone].color, background: tones[tone].background,
      borderRadius: 'var(--radius-pill)', padding: '4px 11px', whiteSpace: 'nowrap', letterSpacing: '.02em',
    }}>{children}</span>
  );
}
