import React, { useState } from 'react';

export function NavPills({ items, active, onChange }) {
  const [cur, setCur] = useState(active ?? items[0]?.key);
  const sel = active ?? cur;
  return (
    <nav style={{
      display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap',
      borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)',
      padding: '7px 0', maxWidth: 'var(--maxw-content)', margin: '0 auto',
    }}>
      {items.map(it => (
        <span key={it.key} onClick={() => { setCur(it.key); onChange && onChange(it.key); }} style={{
          cursor: 'pointer', color: sel === it.key ? 'var(--accent)' : 'var(--text-muted)',
          background: sel === it.key ? 'var(--accent-soft)' : 'transparent',
          fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase',
          padding: '7px 12px', borderRadius: 999, transition: 'color .15s, background .15s',
        }}>{it.label}</span>
      ))}
    </nav>
  );
}
