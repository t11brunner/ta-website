/* @ds-bundle: {"format":4,"namespace":"ETHTADesignSystem_b75858","components":[{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"PlaceholderMedia","sourcePath":"components/core/PlaceholderMedia.jsx"},{"name":"Tag","sourcePath":"components/core/Tag.jsx"},{"name":"RangeControl","sourcePath":"components/forms/RangeControl.jsx"},{"name":"ActionCard","sourcePath":"components/layout/ActionCard.jsx"},{"name":"Row","sourcePath":"components/layout/Row.jsx"},{"name":"SectionHeader","sourcePath":"components/layout/SectionHeader.jsx"},{"name":"NavPills","sourcePath":"components/navigation/NavPills.jsx"}],"sourceHashes":{"components/core/Button.jsx":"37beece51340","components/core/PlaceholderMedia.jsx":"d2568771d820","components/core/Tag.jsx":"11a5dc16e847","components/forms/RangeControl.jsx":"a83e67ada168","components/layout/ActionCard.jsx":"7b1e711dcd3d","components/layout/Row.jsx":"eb21046a5cd9","components/layout/SectionHeader.jsx":"4224092596fe","components/navigation/NavPills.jsx":"ef5349213c44","ui_kits/ta-site/App.jsx":"0f7a7ee63ec5","ui_kits/ta-site/StepResponseDemo.jsx":"d35b9987f076"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.ETHTADesignSystem_b75858 = window.ETHTADesignSystem_b75858 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const sizes = {
    sm: {
      padding: '8px 16px',
      fontSize: 12
    },
    md: {
      padding: '11px 22px',
      fontSize: 13
    },
    lg: {
      padding: '14px 28px',
      fontSize: 14
    }
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
    ...sizes[size]
  };
  const variants = {
    primary: {
      background: 'var(--ink)',
      color: 'var(--paper)',
      borderColor: 'var(--ink)'
    },
    accent: {
      background: 'var(--accent)',
      color: 'var(--paper)',
      borderColor: 'var(--accent)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--ink)',
      borderColor: 'var(--line)'
    },
    text: {
      background: 'transparent',
      color: 'var(--accent)',
      borderColor: 'transparent',
      padding: '4px 2px'
    }
  };
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    onClick: onClick,
    style: {
      ...base,
      ...variants[variant],
      ...style
    },
    onMouseEnter: e => {
      if (!disabled && variant === 'ghost') e.currentTarget.style.borderColor = 'var(--accent)';
      if (!disabled && variant !== 'ghost' && variant !== 'text') e.currentTarget.style.transform = 'translateY(-1px)';
    },
    onMouseLeave: e => {
      if (variant === 'ghost') e.currentTarget.style.borderColor = 'var(--line)';
      e.currentTarget.style.transform = 'none';
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/PlaceholderMedia.jsx
try { (() => {
function PlaceholderMedia({
  label = '',
  height = 130,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'repeating-linear-gradient(45deg, transparent, transparent 8px, var(--hatch) 8px, var(--hatch) 9px)',
      display: 'grid',
      placeItems: 'center',
      color: 'var(--text-muted)',
      fontFamily: 'var(--f-mono)',
      fontSize: 10,
      textAlign: 'center',
      padding: 10,
      letterSpacing: '.04em',
      height,
      ...style
    }
  }, label);
}
Object.assign(__ds_scope, { PlaceholderMedia });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/PlaceholderMedia.jsx", error: String((e && e.message) || e) }); }

// components/core/Tag.jsx
try { (() => {
function Tag({
  children,
  tone = 'accent'
}) {
  const tones = {
    accent: {
      color: 'var(--accent)',
      background: 'var(--accent-soft)'
    },
    dim: {
      color: 'var(--text-muted)',
      background: 'var(--surface-alt)'
    }
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 10,
      color: tones[tone].color,
      background: tones[tone].background,
      borderRadius: 'var(--radius-pill)',
      padding: '4px 11px',
      whiteSpace: 'nowrap',
      letterSpacing: '.02em'
    }
  }, children);
}
Object.assign(__ds_scope, { Tag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Tag.jsx", error: String((e && e.message) || e) }); }

// components/forms/RangeControl.jsx
try { (() => {
function RangeControl({
  label,
  symbol,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  unit = '',
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--f-body)',
      fontWeight: 500,
      fontSize: 14
    }
  }, label, " ", symbol && /*#__PURE__*/React.createElement("em", {
    style: {
      fontFamily: 'var(--f-head)',
      fontStyle: 'italic',
      color: 'var(--text-muted)',
      fontWeight: 400
    }
  }, symbol)), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 13,
      color: 'var(--accent)'
    }
  }, value, unit)), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: min,
    max: max,
    step: step,
    value: value,
    onChange: e => onChange && onChange(parseFloat(e.target.value)),
    style: {
      WebkitAppearance: 'none',
      appearance: 'none',
      width: '100%',
      height: 2,
      borderRadius: 0,
      background: 'var(--border-default)',
      outline: 'none'
    }
  }));
}
Object.assign(__ds_scope, { RangeControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/RangeControl.jsx", error: String((e && e.message) || e) }); }

// components/layout/ActionCard.jsx
try { (() => {
function ActionCard({
  badge,
  label,
  name,
  status,
  available = false,
  href,
  downloadName
}) {
  const inner = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      fontFamily: 'var(--f-mono)',
      fontSize: 9,
      letterSpacing: '.02em',
      background: available ? 'var(--accent-soft)' : 'var(--surface-alt)',
      color: available ? 'var(--accent)' : 'var(--text-muted)'
    }
  }, badge), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      fontFamily: 'var(--f-mono)',
      fontSize: 10,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--text-muted)',
      marginTop: 16
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-head)',
      fontWeight: 600,
      fontSize: 16,
      letterSpacing: '-0.01em',
      marginTop: 6,
      lineHeight: 1.3
    }
  }, available ? name : '—'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 10,
      letterSpacing: '.04em',
      color: available ? 'var(--accent)' : 'var(--text-muted)',
      marginTop: 10
    }
  }, status), available && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 20,
      right: 20,
      color: 'var(--accent)',
      fontSize: 13
    }
  }, "\u2193"));
  const style = {
    position: 'relative',
    display: 'block',
    border: '1px solid var(--border-default)',
    borderRadius: 14,
    background: 'var(--surface-card)',
    padding: '20px 44px 18px 20px',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'border-color .15s, transform .12s',
    cursor: available ? 'pointer' : 'default'
  };
  if (available) {
    return /*#__PURE__*/React.createElement("a", {
      href: href,
      download: downloadName,
      style: style,
      onMouseEnter: e => {
        e.currentTarget.style.borderColor = 'var(--accent)';
        e.currentTarget.style.transform = 'translateY(-3px)';
      },
      onMouseLeave: e => {
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.transform = 'none';
      }
    }, inner);
  }
  return /*#__PURE__*/React.createElement("div", {
    style: style
  }, inner);
}
Object.assign(__ds_scope, { ActionCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/ActionCard.jsx", error: String((e && e.message) || e) }); }

// components/layout/Row.jsx
try { (() => {
function Row({
  number,
  title,
  meta,
  tags = [],
  onClick
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      padding: '20px 10px',
      margin: '0 -10px',
      borderTop: '1px solid var(--border-soft)',
      cursor: 'pointer',
      borderRadius: 10,
      paddingLeft: hover ? 18 : 10,
      background: hover ? 'var(--surface-card)' : 'transparent',
      transition: 'padding-left .14s ease, background .14s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 12,
      color: 'var(--text-muted)',
      width: 24,
      flex: 'none'
    }
  }, number), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-head)',
      fontWeight: 600,
      fontSize: 20,
      lineHeight: 1.15,
      letterSpacing: '-0.01em',
      color: hover ? 'var(--accent)' : 'var(--ink)',
      transition: 'color .14s'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-head)',
      fontWeight: 500,
      fontSize: 11,
      color: 'var(--text-secondary)',
      marginTop: 5,
      letterSpacing: '.06em',
      textTransform: 'uppercase'
    }
  }, meta)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      flex: 'none'
    }
  }, tags, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text-muted)',
      fontSize: 15,
      transition: 'transform .14s',
      transform: hover ? 'translateX(4px)' : 'none'
    }
  }, "\u2192")));
}
Object.assign(__ds_scope, { Row });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Row.jsx", error: String((e && e.message) || e) }); }

// components/layout/SectionHeader.jsx
try { (() => {
function SectionHeader({
  title,
  note
}) {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--f-head)',
      fontWeight: 600,
      fontSize: 28,
      margin: '0 0 12px',
      letterSpacing: '-0.02em'
    }
  }, title), note && /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--text-secondary)',
      fontSize: 15,
      lineHeight: 1.7,
      margin: '0 0 40px',
      maxWidth: '52ch'
    }
  }, note));
}
Object.assign(__ds_scope, { SectionHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/SectionHeader.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavPills.jsx
try { (() => {
const {
  useState
} = React;
function NavPills({
  items,
  active,
  onChange
}) {
  const [cur, setCur] = useState(active ?? items[0]?.key);
  const sel = active ?? cur;
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 4,
      flexWrap: 'wrap',
      borderTop: '1px solid var(--border-default)',
      borderBottom: '1px solid var(--border-default)',
      padding: '7px 0',
      maxWidth: 'var(--maxw-content)',
      margin: '0 auto'
    }
  }, items.map(it => /*#__PURE__*/React.createElement("span", {
    key: it.key,
    onClick: () => {
      setCur(it.key);
      onChange && onChange(it.key);
    },
    style: {
      cursor: 'pointer',
      color: sel === it.key ? 'var(--accent)' : 'var(--text-muted)',
      background: sel === it.key ? 'var(--accent-soft)' : 'transparent',
      fontFamily: 'var(--f-mono)',
      fontSize: 10,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      padding: '7px 12px',
      borderRadius: 999,
      transition: 'color .15s, background .15s'
    }
  }, it.label)));
}
Object.assign(__ds_scope, { NavPills });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavPills.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ta-site/App.jsx
try { (() => {
const {
  useState
} = React;
const YEAR = 2026;
const WEEKS = [{
  n: 1,
  t: "Introduction & System Modeling",
  date: "Aug 31",
  ex: false,
  viz: [],
  hw: {
    t: "Problem Set 1 — Modeling",
    due: "Sep 11",
    ps: false,
    sol: false
  }
}, {
  n: 2,
  t: "Laplace Transforms Review",
  date: "Sep 7",
  ex: false,
  viz: [{
    k: "laplace",
    label: "Laplace pole map"
  }]
}, {
  n: 3,
  t: "Transfer Functions",
  date: "Sep 14",
  ex: false,
  viz: [{
    k: "tfbuild",
    label: "Transfer-function builder"
  }],
  hw: {
    t: "Problem Set 2 — Transfer Functions",
    due: "Sep 25",
    ps: false,
    sol: false
  }
}, {
  n: 4,
  t: "Block Diagrams & Signal Flow",
  date: "Sep 21",
  ex: false,
  viz: [{
    k: "block",
    label: "Block-diagram reduction"
  }]
}, {
  n: 5,
  t: "Time-Domain Response",
  date: "Sep 28",
  ex: true,
  viz: [{
    k: "step2",
    label: "Second-order step response",
    live: true
  }, {
    k: "impulse",
    label: "Step vs impulse"
  }],
  hw: {
    t: "Problem Set 3 — Time Response",
    due: "Oct 2",
    ps: true,
    sol: false
  }
}, {
  n: 6,
  t: "Stability & Routh–Hurwitz",
  date: "Oct 5",
  ex: false,
  viz: [{
    k: "routh",
    label: "Routh array explorer"
  }]
}, {
  n: 7,
  t: "Root Locus",
  date: "Oct 12",
  ex: false,
  viz: [{
    k: "rlocus",
    label: "Root-locus plot"
  }, {
    k: "poledrag",
    label: "Pole / zero drag"
  }],
  hw: {
    t: "Problem Set 4 — Root Locus",
    due: "Oct 16",
    ps: false,
    sol: false
  }
}, {
  n: 8,
  t: "Frequency Response & Bode",
  date: "Oct 19",
  ex: false,
  viz: [{
    k: "bode",
    label: "Bode plot"
  }],
  hw: {
    t: "Problem Set 5 — Frequency Domain",
    due: "Oct 30",
    ps: false,
    sol: false
  }
}, {
  n: 9,
  t: "Nyquist Criterion",
  date: "Oct 26",
  ex: false,
  viz: []
}, {
  n: 10,
  t: "PID Controller Design",
  date: "Nov 2",
  ex: false,
  viz: [{
    k: "pid",
    label: "PID tuner"
  }]
}];
function Back({
  onClick,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 10,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--mute)',
      cursor: 'pointer',
      display: 'inline-flex',
      gap: 7,
      marginBottom: 28,
      alignItems: 'center'
    },
    onMouseEnter: e => e.currentTarget.style.color = 'var(--accent)',
    onMouseLeave: e => e.currentTarget.style.color = 'var(--mute)'
  }, children);
}
function WeeksScreen({
  Row,
  Tag,
  SectionHeader,
  onOpenWeek
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    title: "Weekly material"
  }), /*#__PURE__*/React.createElement("div", null, WEEKS.map(w => /*#__PURE__*/React.createElement(Row, {
    key: w.n,
    number: String(w.n).padStart(2, '0'),
    title: w.t,
    meta: `LECTURE · ${w.date.toUpperCase()}, ${YEAR}`,
    tags: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Tag, {
      tone: w.ex ? 'accent' : 'dim'
    }, w.ex ? 'slides ↓' : 'soon'), w.viz.length ? /*#__PURE__*/React.createElement(Tag, null, w.viz.length, " viz") : null, w.hw ? /*#__PURE__*/React.createElement(Tag, null, "PS due") : null),
    onClick: () => onOpenWeek(w.n)
  }))));
}
function WeekDetailScreen({
  week,
  ActionCard,
  PlaceholderMedia,
  onBack,
  onOpenViz
}) {
  const w = week;
  const pad = String(w.n).padStart(2, '0');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(Back, {
    onClick: onBack
  }, "\u2190 all weeks"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 10,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--accent)'
    }
  }, "WEEK ", pad), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '14px 0 22px'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--f-head)',
      fontWeight: 700,
      fontSize: 40,
      margin: 0,
      letterSpacing: '-0.025em'
    }
  }, w.t)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 26,
      flexWrap: 'wrap',
      fontSize: 13,
      color: 'var(--mute)',
      paddingBottom: 22,
      borderBottom: '1px solid var(--line-soft)'
    }
  }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--ink)',
      fontWeight: 500
    }
  }, w.date, ", ", YEAR), " \xA0exercise session")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 10,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--mute)',
      margin: '44px 0 16px'
    }
  }, "Downloads"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 14,
      margin: '28px 0 8px'
    }
  }, /*#__PURE__*/React.createElement(ActionCard, {
    badge: "EX",
    label: "Exercise slides",
    name: `CS301-week-${pad}-exercise.pdf`,
    status: w.ex ? 'available · click to download' : 'posts on session day',
    available: w.ex,
    href: `slides/week-${pad}-exercise.pdf`,
    downloadName: `CS301-week-${pad}-exercise.pdf`
  }), w.hw ? /*#__PURE__*/React.createElement(ActionCard, {
    badge: "PS",
    label: "Problem set",
    name: `CS301-week-${pad}-problemset.pdf`,
    status: w.hw.ps ? `due ${w.hw.due}` : `due ${w.hw.due} · posting soon`,
    available: w.hw.ps,
    href: `slides/week-${pad}-problemset.pdf`,
    downloadName: `CS301-week-${pad}-problemset.pdf`
  }) : /*#__PURE__*/React.createElement(ActionCard, {
    badge: "PS",
    label: "Problem set",
    name: "",
    status: "no problem set this week",
    available: false
  }), w.hw ? /*#__PURE__*/React.createElement(ActionCard, {
    badge: "SOL",
    label: "Solutions",
    name: `CS301-week-${pad}-solutions.pdf`,
    status: w.hw.sol ? 'available · click to download' : 'posts after due date',
    available: w.hw.sol,
    href: `slides/week-${pad}-solutions.pdf`,
    downloadName: `CS301-week-${pad}-solutions.pdf`
  }) : /*#__PURE__*/React.createElement(ActionCard, {
    badge: "SOL",
    label: "Solutions",
    name: "",
    status: "no problem set this week",
    available: false
  })), w.viz.length > 0 && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 10,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--mute)',
      margin: '44px 0 16px'
    }
  }, "Visualisations for this week"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 28
    }
  }, w.viz.map(v => /*#__PURE__*/React.createElement("div", {
    key: v.k,
    style: {
      cursor: 'pointer'
    },
    onClick: () => onOpenViz(v, w)
  }, /*#__PURE__*/React.createElement(PlaceholderMedia, {
    label: v.label.toLowerCase(),
    height: 130,
    style: {
      marginBottom: 12,
      borderRadius: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-head)',
      fontWeight: 600,
      fontSize: 16,
      letterSpacing: '-0.01em'
    }
  }, v.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 9,
      color: 'var(--mute)',
      marginTop: 5
    }
  }, v.live ? '● interactive' : '○ in development'))))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 10,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--mute)',
      margin: '44px 0 16px'
    }
  }, "Reading & notes"), /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 16,
      lineHeight: 1.6,
      maxWidth: '62ch'
    }
  }, "Lecture notes and suggested textbook sections will appear here. For now this space shows where per-week supplementary material lives."));
}
function VizGalleryScreen({
  PlaceholderMedia,
  SectionHeader,
  onOpenViz
}) {
  const all = [];
  WEEKS.forEach(w => w.viz.forEach(v => all.push({
    v,
    w
  })));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 980,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    title: "Visualisations",
    note: "Interactive demos that accompany the lectures, grouped by topic. Each one also appears on the page of the week it belongs to. The second-order step response below is the first live demo \u2014 the rest follow the same template."
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3,1fr)',
      gap: 28
    }
  }, all.map(({
    v,
    w
  }) => /*#__PURE__*/React.createElement("div", {
    key: v.k,
    style: {
      cursor: 'pointer'
    },
    onClick: () => onOpenViz(v, w)
  }, /*#__PURE__*/React.createElement(PlaceholderMedia, {
    label: v.label.toLowerCase(),
    height: 130,
    style: {
      marginBottom: 12,
      borderRadius: 0
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-head)',
      fontWeight: 600,
      fontSize: 16,
      lineHeight: 1.2,
      letterSpacing: '-0.01em'
    }
  }, v.label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 9,
      color: 'var(--mute)',
      marginTop: 5,
      letterSpacing: '.04em'
    }
  }, "WEEK ", String(w.n).padStart(2, '0'), " \xB7 ", w.t), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 9,
      marginTop: 6,
      letterSpacing: '.04em',
      color: v.live ? 'var(--accent)' : 'var(--mute)'
    }
  }, v.live ? '● interactive' : '○ in development')))));
}
function VizDetailScreen({
  viz,
  week,
  PlaceholderMedia,
  onBack
}) {
  const isLive = viz.v.k === 'step2';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 980,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement(Back, {
    onClick: onBack
  }, "\u2190 all visualisations"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 10,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--mute)'
    }
  }, "WEEK ", String(week.n).padStart(2, '0'), " \xB7 VISUALISATION"), /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--f-head)',
      fontWeight: 600,
      fontSize: 28,
      margin: '12px 0 14px',
      letterSpacing: '-0.02em'
    }
  }, viz.v.label), isLive ? React.createElement(window.StepResponseDemo) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(PlaceholderMedia, {
    label: "visualisation in development \u2014 coming during the semester",
    height: 280
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      color: 'var(--ink-soft)',
      fontSize: 15,
      lineHeight: 1.7,
      marginTop: 22,
      maxWidth: '52ch'
    }
  }, "This demo will be built using the same interactive template as the second-order step response. Check back when the relevant week goes live.")));
}
function TaSiteApp() {
  const {
    NavPills,
    Row,
    Tag,
    ActionCard,
    PlaceholderMedia,
    SectionHeader
  } = window.ETHTADesignSystem_b75858;
  const [screen, setScreen] = useState('weeks');
  const [openWeekN, setOpenWeekN] = useState(null);
  const [openViz, setOpenViz] = useState(null);
  const week = WEEKS.find(w => w.n === openWeekN);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100vh',
      background: 'var(--paper)',
      padding: '0 24px 100px',
      fontFamily: 'var(--f-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 760,
      margin: '0 auto',
      padding: '100px 0 0',
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      fontFamily: 'var(--f-head)',
      fontWeight: 700,
      fontSize: 56,
      lineHeight: 1.05,
      margin: 0,
      letterSpacing: '-0.02em'
    }
  }, "Control Systems\xA0I"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 11,
      color: 'var(--mute)',
      letterSpacing: '.08em',
      marginTop: 14
    }
  }, "tibrunner@ethz.ch")), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '44px auto 56px'
    }
  }, /*#__PURE__*/React.createElement(NavPills, {
    items: [{
      key: 'weeks',
      label: 'weeks'
    }, {
      key: 'viz',
      label: 'visualisations'
    }],
    active: screen === 'week' ? 'weeks' : screen === 'viz-detail' ? 'viz' : screen,
    onChange: k => setScreen(k)
  })), screen === 'weeks' && /*#__PURE__*/React.createElement(WeeksScreen, {
    Row: Row,
    Tag: Tag,
    SectionHeader: SectionHeader,
    onOpenWeek: n => {
      setOpenWeekN(n);
      setScreen('week');
    }
  }), screen === 'week' && week && /*#__PURE__*/React.createElement(WeekDetailScreen, {
    week: week,
    ActionCard: ActionCard,
    PlaceholderMedia: PlaceholderMedia,
    onBack: () => setScreen('weeks'),
    onOpenViz: (v, w) => {
      setOpenViz({
        v,
        w
      });
      setScreen('viz-detail');
    }
  }), screen === 'viz' && /*#__PURE__*/React.createElement(VizGalleryScreen, {
    PlaceholderMedia: PlaceholderMedia,
    SectionHeader: SectionHeader,
    onOpenViz: (v, w) => {
      setOpenViz({
        v,
        w
      });
      setScreen('viz-detail');
    }
  }), screen === 'viz-detail' && openViz && /*#__PURE__*/React.createElement(VizDetailScreen, {
    viz: openViz,
    week: openViz.w,
    PlaceholderMedia: PlaceholderMedia,
    onBack: () => setScreen('viz')
  }), /*#__PURE__*/React.createElement("footer", {
    style: {
      maxWidth: 760,
      margin: '100px auto 0',
      fontFamily: 'var(--f-mono)',
      fontSize: 10,
      color: 'var(--mute)',
      borderTop: '1px solid var(--line)',
      paddingTop: 22,
      letterSpacing: '.14em'
    }
  }, "CONTROL SYSTEMS I \xB7 TA SITE \xB7 FS26 \xB7 HOSTED ON GITHUB PAGES"));
}
window.TaSiteApp = TaSiteApp;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ta-site/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/ta-site/StepResponseDemo.jsx
try { (() => {
const {
  useRef,
  useEffect,
  useState
} = React;
function simulate(zeta, wn) {
  const dt = 0.004;
  const T = Math.min(45, Math.max(6, 9 / (zeta * wn + 0.25)));
  const n = Math.ceil(T / dt);
  let x1 = 0,
    x2 = 0;
  const ts = new Array(n + 1),
    ys = new Array(n + 1);
  const f = (a, b) => [b, wn * wn * (1 - a) - 2 * zeta * wn * b];
  for (let i = 0; i <= n; i++) {
    ts[i] = i * dt;
    ys[i] = x1;
    const k1 = f(x1, x2);
    const k2 = f(x1 + dt / 2 * k1[0], x2 + dt / 2 * k1[1]);
    const k3 = f(x1 + dt / 2 * k2[0], x2 + dt / 2 * k2[1]);
    const k4 = f(x1 + dt * k3[0], x2 + dt * k3[1]);
    x1 += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    x2 += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
  }
  return {
    ts,
    ys,
    T
  };
}
function metrics(sim) {
  const {
    ts,
    ys
  } = sim;
  let peak = -Infinity,
    tp = 0;
  for (let i = 0; i < ys.length; i++) if (ys[i] > peak) {
    peak = ys[i];
    tp = ts[i];
  }
  const os = peak > 1 ? (peak - 1) * 100 : 0;
  let ts2 = ts[ts.length - 1];
  for (let i = ys.length - 1; i >= 0; i--) {
    if (Math.abs(ys[i] - 1) > 0.02) {
      ts2 = ts[Math.min(i + 1, ts.length - 1)];
      break;
    }
    if (i === 0) ts2 = 0;
  }
  let t10 = null,
    t90 = null;
  for (let i = 0; i < ys.length; i++) {
    if (t10 === null && ys[i] >= 0.1) t10 = ts[i];
    if (t90 === null && ys[i] >= 0.9) {
      t90 = ts[i];
      break;
    }
  }
  const tr = t10 !== null && t90 !== null ? t90 - t10 : null;
  return {
    os,
    tp,
    ts2,
    tr,
    peak
  };
}
function sizeCanvas(cv) {
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth,
    h = cv.getAttribute('height') * 1;
  cv.width = w * dpr;
  cv.height = h * dpr;
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return {
    w,
    h,
    ctx
  };
}
function fmt(v, suf) {
  return v === null || !isFinite(v) ? '—' : v.toFixed(v < 10 ? 2 : 1) + (suf || '');
}
function StepResponseDemo() {
  const cvStepRef = useRef(null),
    cvSRef = useRef(null);
  const [zeta, setZeta] = useState(0.5),
    [wn, setWn] = useState(2);
  function draw() {
    const cvStep = cvStepRef.current,
      cvS = cvSRef.current;
    if (!cvStep || !cvS) return;
    const stepGeom = sizeCanvas(cvStep),
      splaneGeom = sizeCanvas(cvS);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || 'oklch(0.52 0.09 250)';
    const sim = simulate(zeta, wn);
    const m = metrics(sim);
    {
      const {
        w,
        h,
        ctx
      } = stepGeom;
      ctx.clearRect(0, 0, w, h);
      const padL = 42,
        padR = 14,
        padT = 16,
        padB = 28,
        pw = w - padL - padR,
        ph = h - padT - padB;
      const {
        ts,
        ys,
        T
      } = sim;
      let ymax = 1;
      for (const y of ys) if (y > ymax) ymax = y;
      ymax = Math.max(1.08, ymax * 1.08);
      const X = t => padL + t / T * pw,
        Y = y => padT + ph - y / ymax * ph;
      ctx.fillStyle = 'color-mix(in srgb,' + accent + ' 10%, transparent)';
      ctx.fillRect(padL, Y(1.02), pw, Y(0.98) - Y(1.02));
      ctx.strokeStyle = '#e9e7df';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#a3a296';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      [0, 0.5, 1, 1.5, 2].filter(v => v <= ymax + 0.001).forEach(v => {
        const yy = Y(v);
        ctx.beginPath();
        ctx.moveTo(padL, yy);
        ctx.lineTo(w - padR, yy);
        ctx.stroke();
        ctx.fillText(v.toFixed(1), padL - 7, yy);
      });
      ctx.strokeStyle = '#a3a296';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, Y(1));
      ctx.lineTo(w - padR, Y(1));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      const xstep = T <= 8 ? 2 : T <= 20 ? 5 : 10;
      for (let t = 0; t <= T + 0.001; t += xstep) {
        const xx = X(t);
        ctx.strokeStyle = '#efeee6';
        ctx.beginPath();
        ctx.moveTo(xx, padT);
        ctx.lineTo(xx, padT + ph);
        ctx.stroke();
        ctx.fillStyle = '#a3a296';
        ctx.fillText(t + 's', xx, padT + ph + 6);
      }
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      for (let i = 0; i < ys.length; i++) {
        const xx = X(ts[i]),
          yy = Y(ys[i]);
        i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
      }
      ctx.stroke();
      if (m.peak > 1.001) {
        const px = X(m.tp),
          py = Y(m.peak);
        ctx.fillStyle = accent;
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, 7);
        ctx.fill();
      }
    }
    {
      const {
        w,
        h,
        ctx
      } = splaneGeom;
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.74,
        cy = h / 2;
      const mag = (zeta + Math.sqrt(Math.max(zeta * zeta - 1, 0))) * wn;
      const range = Math.max(mag * 1.2, wn * 1.25, 1);
      const sx = v => cx + v / range * (w * 0.66),
        sy = v => cy - v / range * (h * 0.42);
      ctx.strokeStyle = '#dedcd2';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(w, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, h);
      ctx.stroke();
      ctx.fillStyle = '#a3a296';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'top';
      ctx.fillText('Re', w - 4, cy + 4);
      ctx.textAlign = 'left';
      ctx.fillText('Im', cx + 4, 3);
      const sigma = -zeta * wn;
      let poles;
      if (zeta < 1) {
        const wd = wn * Math.sqrt(1 - zeta * zeta);
        poles = [[sigma, wd], [sigma, -wd]];
      } else {
        const d = wn * Math.sqrt(zeta * zeta - 1);
        poles = [[sigma + d, 0], [sigma - d, 0]];
      }
      ctx.strokeStyle = accent;
      ctx.lineWidth = 2.2;
      poles.forEach(p => {
        const x = sx(p[0]),
          y = sy(p[1]),
          r = 5;
        ctx.beginPath();
        ctx.moveTo(x - r, y - r);
        ctx.lineTo(x + r, y + r);
        ctx.moveTo(x + r, y - r);
        ctx.lineTo(x - r, y + r);
        ctx.stroke();
      });
    }
    return m;
  }
  const [readouts, setReadouts] = useState({
    os: 0,
    tp: null,
    tr: null,
    ts2: 0
  });
  useEffect(() => {
    const m = draw();
    if (m) setReadouts(m);
  }, [zeta, wn]);
  useEffect(() => {
    const onResize = () => {
      const m = draw();
      if (m) setReadouts(m);
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);
  let regime;
  if (zeta < 0.001) regime = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--accent)',
      fontWeight: 500
    }
  }, "undamped"), " \u2014 poles on the imaginary axis, sustained oscillation");else if (zeta < 1) regime = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--accent)',
      fontWeight: 500
    }
  }, "under-damped"), " \u2014 complex poles, oscillatory response");else if (Math.abs(zeta - 1) < 0.02) regime = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--accent)',
      fontWeight: 500
    }
  }, "critically damped"), " \u2014 repeated real pole, fastest with no overshoot");else regime = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--accent)',
      fontWeight: 500
    }
  }, "over-damped"), " \u2014 two real poles, sluggish, no overshoot");
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("p", {
    style: {
      fontFamily: 'var(--f-body)',
      color: 'var(--ink-soft)',
      fontSize: 15,
      lineHeight: 1.7,
      marginBottom: 24,
      maxWidth: '70ch'
    }
  }, "Every second-order system ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 13,
      background: 'var(--paper-2)',
      padding: '3px 8px',
      borderRadius: 8,
      color: 'var(--ink)'
    }
  }, "G(s) = \u03C9\u2099\xB2 / (s\xB2 + 2\u03B6\u03C9\u2099s + \u03C9\u2099\xB2)"), " is characterised by its damping ratio \u03B6 and natural frequency \u03C9\u2099. Drag the sliders to see how the poles move and how the step response changes."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1.7fr 1fr',
      gap: 40,
      alignItems: 'start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--line)',
      borderRadius: 14,
      background: 'var(--card)',
      padding: '16px 18px 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 10,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--mute)',
      marginBottom: 6
    }
  }, "Step response \xB7 y(t)"), /*#__PURE__*/React.createElement("canvas", {
    ref: cvStepRef,
    height: "340",
    style: {
      display: 'block',
      width: '100%'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 26
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--line)',
      borderRadius: 14,
      background: 'var(--card)',
      padding: '14px 16px 8px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 10,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--mute)',
      marginBottom: 6
    }
  }, "Pole locations \xB7 s-plane"), /*#__PURE__*/React.createElement("canvas", {
    ref: cvSRef,
    height: "190",
    style: {
      display: 'block',
      width: '100%'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '22px 26px'
    }
  }, [['Overshoot', readouts.os < 0.05 ? '0%' : readouts.os.toFixed(1) + '%'], ['Peak time', readouts.os < 0.05 ? '—' : fmt(readouts.tp) + 's'], ['Rise time 10–90%', readouts.tr === null ? '—' : fmt(readouts.tr) + 's'], ['Settling 2%', fmt(readouts.ts2) + 's']].map(([k, v]) => /*#__PURE__*/React.createElement("div", {
    key: k
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 10,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--mute)'
    }
  }, k), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-head)',
      fontWeight: 600,
      fontSize: 26,
      marginTop: 4,
      letterSpacing: '-0.01em'
    }
  }, v)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--line)',
      borderRadius: 14,
      background: 'var(--card)',
      padding: '22px 24px',
      marginTop: 28
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      fontSize: 14
    }
  }, "Damping ratio \xA0", /*#__PURE__*/React.createElement("em", {
    style: {
      fontFamily: 'var(--f-head)',
      fontStyle: 'italic',
      color: 'var(--mute)',
      fontWeight: 400
    }
  }, "\u03B6")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 13,
      color: 'var(--accent)'
    }
  }, zeta.toFixed(2))), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0",
    max: "2",
    step: "0.01",
    value: zeta,
    onChange: e => setZeta(parseFloat(e.target.value)),
    style: {
      WebkitAppearance: 'none',
      appearance: 'none',
      width: '100%',
      height: 2,
      background: 'var(--line)',
      outline: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 11,
      color: 'var(--mute)',
      marginTop: 12
    }
  }, "Regime: ", regime)), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 500,
      fontSize: 14
    }
  }, "Natural frequency \xA0", /*#__PURE__*/React.createElement("em", {
    style: {
      fontFamily: 'var(--f-head)',
      fontStyle: 'italic',
      color: 'var(--mute)',
      fontWeight: 400
    }
  }, "\u03C9\u2099")), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 13,
      color: 'var(--accent)'
    }
  }, wn.toFixed(1), " rad/s")), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: "0.5",
    max: "6",
    step: "0.1",
    value: wn,
    onChange: e => setWn(parseFloat(e.target.value)),
    style: {
      WebkitAppearance: 'none',
      appearance: 'none',
      width: '100%',
      height: 2,
      background: 'var(--line)',
      outline: 'none'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--f-mono)',
      fontSize: 10,
      letterSpacing: '.14em',
      textTransform: 'uppercase',
      color: 'var(--mute)',
      margin: '44px 0 16px'
    }
  }, "What to notice"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      lineHeight: 1.6
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '0 0 12px',
      maxWidth: '64ch'
    }
  }, "As \u03B6 drops below 1 the poles become a complex-conjugate pair and the response overshoots and rings. At \u03B6 = 1 (critically damped) the response is the fastest possible with no overshoot. Above \u03B6 = 1 the poles split onto the real axis and the response becomes sluggish."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: '64ch'
    }
  }, "\u03C9\u2099 scales the speed of everything: larger \u03C9\u2099 pushes the poles further from the origin, shrinking rise and settling times while leaving the overshoot percentage unchanged.")));
}
window.StepResponseDemo = StepResponseDemo;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/ta-site/StepResponseDemo.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.PlaceholderMedia = __ds_scope.PlaceholderMedia;

__ds_ns.Tag = __ds_scope.Tag;

__ds_ns.RangeControl = __ds_scope.RangeControl;

__ds_ns.ActionCard = __ds_scope.ActionCard;

__ds_ns.Row = __ds_scope.Row;

__ds_ns.SectionHeader = __ds_scope.SectionHeader;

__ds_ns.NavPills = __ds_scope.NavPills;

})();
