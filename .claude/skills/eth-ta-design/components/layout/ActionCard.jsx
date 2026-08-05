import React from 'react';

export function ActionCard({ badge, label, name, status, available = false, href, downloadName }) {
  const inner = (
    <React.Fragment>
      <span style={{
        width: 32, height: 32, borderRadius: '50%', display: 'grid', placeItems: 'center',
        fontFamily: 'var(--f-mono)', fontSize: 9, letterSpacing: '.02em',
        background: available ? 'var(--accent-soft)' : 'var(--surface-alt)', color: available ? 'var(--accent)' : 'var(--text-muted)',
      }}>{badge}</span>
      <span style={{ display: 'block', fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 16 }}>{label}</span>
      <div style={{ fontFamily: 'var(--f-head)', fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em', marginTop: 6, lineHeight: 1.3 }}>{available ? name : '—'}</div>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.04em', color: available ? 'var(--accent)' : 'var(--text-muted)', marginTop: 10 }}>{status}</div>
      {available && <span style={{ position: 'absolute', top: 20, right: 20, color: 'var(--accent)', fontSize: 13 }}>↓</span>}
    </React.Fragment>
  );
  const style = {
    position: 'relative', display: 'block', border: '1px solid var(--border-default)', borderRadius: 14,
    background: 'var(--surface-card)', padding: '20px 44px 18px 20px', textDecoration: 'none', color: 'inherit',
    transition: 'border-color .15s, transform .12s', cursor: available ? 'pointer' : 'default',
  };
  if (available) {
    return <a href={href} download={downloadName} style={style}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.transform = 'none'; }}>{inner}</a>;
  }
  return <div style={style}>{inner}</div>;
}
