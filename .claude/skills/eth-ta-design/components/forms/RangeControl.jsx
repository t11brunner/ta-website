import React from 'react';

export function RangeControl({ label, symbol, value, min = 0, max = 1, step = 0.01, unit = '', onChange }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <span style={{ fontFamily: 'var(--f-body)', fontWeight: 500, fontSize: 14 }}>
          {label} {symbol && <em style={{ fontFamily: 'var(--f-head)', fontStyle: 'italic', color: 'var(--text-muted)', fontWeight: 400 }}>{symbol}</em>}
        </span>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--accent)' }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange && onChange(parseFloat(e.target.value))}
        style={{ WebkitAppearance: 'none', appearance: 'none', width: '100%', height: 2, borderRadius: 0, background: 'var(--border-default)', outline: 'none' }} />
    </div>
  );
}
