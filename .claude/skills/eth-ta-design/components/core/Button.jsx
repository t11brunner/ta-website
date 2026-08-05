import React from 'react';

export function Button({ children, variant = 'primary', size = 'md', disabled = false, onClick, style, ...rest }) {
  const sizes = {
    sm: { padding: '8px 16px', fontSize: 12 },
    md: { padding: '11px 22px', fontSize: 13 },
    lg: { padding: '14px 28px', fontSize: 14 },
  };
  const base = {
    fontFamily: 'var(--f-mono)',
    letterSpacing: '.1em',
    textTransform: 'uppercase',
    border: '1px solid transparent',
    borderRadius: 'var(--radius-pill)',
    cursor: disabled ? 'default' : 'pointer',
    transition: 'background .15s, color .15s, border-color .15s, transform .12s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    opacity: disabled ? 0.45 : 1,
    ...sizes[size],
  };
  const variants = {
    primary: { background: 'var(--ink)', color: 'var(--paper)', borderColor: 'var(--ink)' },
    accent: { background: 'var(--accent)', color: 'var(--paper)', borderColor: 'var(--accent)' },
    ghost: { background: 'transparent', color: 'var(--ink)', borderColor: 'var(--line)' },
    text: { background: 'transparent', color: 'var(--accent)', borderColor: 'transparent', padding: '4px 2px' },
  };
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={(e) => { if (!disabled && variant === 'ghost') e.currentTarget.style.borderColor = 'var(--accent)'; if (!disabled && variant !== 'ghost' && variant !== 'text') e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={(e) => { if (variant === 'ghost') e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.transform = 'none'; }}
      {...rest}
    >
      {children}
    </button>
  );
}
