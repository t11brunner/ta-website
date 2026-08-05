import React from 'react';

export function Row({ number, title, meta, tags = [], onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      display: 'flex', alignItems: 'center', gap: 24, padding: '20px 10px', margin: '0 -10px',
      borderTop: '1px solid var(--border-soft)', cursor: 'pointer', borderRadius: 10,
      paddingLeft: hover ? 18 : 10, background: hover ? 'var(--surface-card)' : 'transparent',
      transition: 'padding-left .14s ease, background .14s',
    }}>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--text-muted)', width: 24, flex: 'none' }}>{number}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--f-head)', fontWeight: 600, fontSize: 20, lineHeight: 1.15, letterSpacing: '-0.01em', color: hover ? 'var(--accent)' : 'var(--ink)', transition: 'color .14s' }}>{title}</div>
        <div style={{ fontFamily: 'var(--f-head)', fontWeight: 500, fontSize: 11, color: 'var(--text-secondary)', marginTop: 5, letterSpacing: '.06em', textTransform: 'uppercase' }}>{meta}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 'none' }}>
        {tags}
        <span style={{ color: 'var(--text-muted)', fontSize: 15, transition: 'transform .14s', transform: hover ? 'translateX(4px)' : 'none' }}>→</span>
      </div>
    </div>
  );
}
