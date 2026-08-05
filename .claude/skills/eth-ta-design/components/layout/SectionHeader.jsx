import React from 'react';

export function SectionHeader({ title, note }) {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--f-head)', fontWeight: 600, fontSize: 28, margin: '0 0 12px', letterSpacing: '-0.02em' }}>{title}</h2>
      {note && <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, margin: '0 0 40px', maxWidth: '52ch' }}>{note}</p>}
    </div>
  );
}
