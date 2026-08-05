import React from 'react';

export function PlaceholderMedia({ label = '', height = 130, style }) {
  return (
    <div style={{
      background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, var(--hatch) 8px, var(--hatch) 9px)',
      display: 'grid', placeItems: 'center', color: 'var(--text-muted)',
      fontFamily: 'var(--f-mono)', fontSize: 10, textAlign: 'center', padding: 10,
      letterSpacing: '.04em', height, ...style,
    }}>{label}</div>
  );
}
