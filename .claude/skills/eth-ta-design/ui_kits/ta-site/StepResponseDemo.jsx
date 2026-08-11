const { useRef, useEffect, useState } = React;

function simulate(zeta, wn) {
  const dt = 0.004;
  const T = Math.min(45, Math.max(6, 9 / (zeta * wn + 0.25)));
  const n = Math.ceil(T / dt);
  let x1 = 0, x2 = 0; const ts = new Array(n + 1), ys = new Array(n + 1);
  const f = (a, b) => [b, wn * wn * (1 - a) - 2 * zeta * wn * b];
  for (let i = 0; i <= n; i++) {
    ts[i] = i * dt; ys[i] = x1;
    const k1 = f(x1, x2);
    const k2 = f(x1 + dt / 2 * k1[0], x2 + dt / 2 * k1[1]);
    const k3 = f(x1 + dt / 2 * k2[0], x2 + dt / 2 * k2[1]);
    const k4 = f(x1 + dt * k3[0], x2 + dt * k3[1]);
    x1 += dt / 6 * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]);
    x2 += dt / 6 * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1]);
  }
  return { ts, ys, T };
}

function metrics(sim) {
  const { ts, ys } = sim;
  let peak = -Infinity, tp = 0;
  for (let i = 0; i < ys.length; i++) if (ys[i] > peak) { peak = ys[i]; tp = ts[i]; }
  const os = peak > 1 ? (peak - 1) * 100 : 0;
  let ts2 = ts[ts.length - 1];
  for (let i = ys.length - 1; i >= 0; i--) { if (Math.abs(ys[i] - 1) > 0.02) { ts2 = ts[Math.min(i + 1, ts.length - 1)]; break; } if (i === 0) ts2 = 0; }
  let t10 = null, t90 = null;
  for (let i = 0; i < ys.length; i++) { if (t10 === null && ys[i] >= 0.1) t10 = ts[i]; if (t90 === null && ys[i] >= 0.9) { t90 = ts[i]; break; } }
  const tr = (t10 !== null && t90 !== null) ? (t90 - t10) : null;
  return { os, tp, ts2, tr, peak };
}

function sizeCanvas(cv) {
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth, h = cv.getAttribute('height') * 1;
  cv.width = w * dpr; cv.height = h * dpr;
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h, ctx };
}

function fmt(v, suf) { return v === null || !isFinite(v) ? '—' : v.toFixed(v < 10 ? 2 : 1) + (suf || ''); }

function StepResponseDemo() {
  const cvStepRef = useRef(null), cvSRef = useRef(null);
  const [zeta, setZeta] = useState(0.5), [wn, setWn] = useState(2);

  function draw() {
    const cvStep = cvStepRef.current, cvS = cvSRef.current;
    if (!cvStep || !cvS) return;
    const stepGeom = sizeCanvas(cvStep), splaneGeom = sizeCanvas(cvS);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || 'oklch(0.52 0.09 250)';
    const sim = simulate(zeta, wn); const m = metrics(sim);

    { const { w, h, ctx } = stepGeom;
      ctx.clearRect(0, 0, w, h);
      const padL = 42, padR = 14, padT = 16, padB = 28, pw = w - padL - padR, ph = h - padT - padB;
      const { ts, ys, T } = sim;
      let ymax = 1; for (const y of ys) if (y > ymax) ymax = y;
      ymax = Math.max(1.08, ymax * 1.08);
      const X = t => padL + (t / T) * pw, Y = y => padT + ph - (y / ymax) * ph;
      ctx.fillStyle = 'color-mix(in srgb,' + accent + ' 10%, transparent)';
      ctx.fillRect(padL, Y(1.02), pw, Y(0.98) - Y(1.02));
      ctx.strokeStyle = '#dde3e5'; ctx.lineWidth = 1; ctx.fillStyle = '#8b9497';
      ctx.font = '10px JetBrains Mono, monospace'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      [0, 0.5, 1, 1.5, 2].filter(v => v <= ymax + 0.001).forEach(v => { const yy = Y(v); ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(w - padR, yy); ctx.stroke(); ctx.fillText(v.toFixed(1), padL - 7, yy); });
      ctx.strokeStyle = '#8b9497'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(padL, Y(1)); ctx.lineTo(w - padR, Y(1)); ctx.stroke(); ctx.setLineDash([]);
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      const xstep = T <= 8 ? 2 : T <= 20 ? 5 : 10;
      for (let t = 0; t <= T + 0.001; t += xstep) { const xx = X(t); ctx.strokeStyle = '#e3e9eb'; ctx.beginPath(); ctx.moveTo(xx, padT); ctx.lineTo(xx, padT + ph); ctx.stroke(); ctx.fillStyle = '#8b9497'; ctx.fillText(t + 's', xx, padT + ph + 6); }
      ctx.strokeStyle = accent; ctx.lineWidth = 2.4; ctx.beginPath();
      for (let i = 0; i < ys.length; i++) { const xx = X(ts[i]), yy = Y(ys[i]); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
      ctx.stroke();
      if (m.peak > 1.001) { const px = X(m.tp), py = Y(m.peak); ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(px, py, 3.5, 0, 7); ctx.fill(); }
    }
    { const { w, h, ctx } = splaneGeom;
      ctx.clearRect(0, 0, w, h);
      const cx = w * 0.74, cy = h / 2;
      const mag = (zeta + Math.sqrt(Math.max(zeta * zeta - 1, 0))) * wn;
      const range = Math.max(mag * 1.2, wn * 1.25, 1);
      const sx = v => cx + (v / range) * (w * 0.66), sy = v => cy - (v / range) * (h * 0.42);
      ctx.strokeStyle = '#d1d8da'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();
      ctx.fillStyle = '#8b9497'; ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.fillText('Re', w - 4, cy + 4);
      ctx.textAlign = 'left'; ctx.fillText('Im', cx + 4, 3);
      const sigma = -zeta * wn; let poles;
      if (zeta < 1) { const wd = wn * Math.sqrt(1 - zeta * zeta); poles = [[sigma, wd], [sigma, -wd]]; }
      else { const d = wn * Math.sqrt(zeta * zeta - 1); poles = [[sigma + d, 0], [sigma - d, 0]]; }
      ctx.strokeStyle = accent; ctx.lineWidth = 2.2;
      poles.forEach(p => { const x = sx(p[0]), y = sy(p[1]), r = 5; ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r); ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r); ctx.stroke(); });
    }
    return m;
  }

  const [readouts, setReadouts] = useState({ os: 0, tp: null, tr: null, ts2: 0 });
  useEffect(() => { const m = draw(); if (m) setReadouts(m); }, [zeta, wn]);
  useEffect(() => {
    const onResize = () => { const m = draw(); if (m) setReadouts(m); };
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  let regime;
  if (zeta < 0.001) regime = <React.Fragment><b style={{ color: 'var(--accent)', fontWeight: 500 }}>undamped</b> — poles on the imaginary axis, sustained oscillation</React.Fragment>;
  else if (zeta < 1) regime = <React.Fragment><b style={{ color: 'var(--accent)', fontWeight: 500 }}>under-damped</b> — complex poles, oscillatory response</React.Fragment>;
  else if (Math.abs(zeta - 1) < 0.02) regime = <React.Fragment><b style={{ color: 'var(--accent)', fontWeight: 500 }}>critically damped</b> — repeated real pole, fastest with no overshoot</React.Fragment>;
  else regime = <React.Fragment><b style={{ color: 'var(--accent)', fontWeight: 500 }}>over-damped</b> — two real poles, sluggish, no overshoot</React.Fragment>;

  return (
    <div>
      <p style={{ fontFamily: 'var(--f-body)', color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.7, marginBottom: 24, maxWidth: '70ch' }}>
        Every second-order system <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, background: 'var(--paper-2)', padding: '3px 8px', borderRadius: 8, color: 'var(--ink)' }}>G(s) = ωₙ² / (s² + 2ζωₙs + ωₙ²)</span> is characterised by its damping ratio ζ and natural frequency ωₙ. Drag the sliders to see how the poles move and how the step response changes.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 40, alignItems: 'start' }}>
        <div style={{ border: '1px solid var(--line)', borderRadius: 14, background: 'var(--card)', padding: '16px 18px 8px' }}>
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--mute)', marginBottom: 6 }}>Step response · y(t)</div>
          <canvas ref={cvStepRef} height="340" style={{ display: 'block', width: '100%' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
          <div style={{ border: '1px solid var(--line)', borderRadius: 14, background: 'var(--card)', padding: '14px 16px 8px' }}>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--mute)', marginBottom: 6 }}>Pole locations · s-plane</div>
            <canvas ref={cvSRef} height="190" style={{ display: 'block', width: '100%' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '22px 26px' }}>
            {[['Overshoot', readouts.os < 0.05 ? '0%' : readouts.os.toFixed(1) + '%'], ['Peak time', readouts.os < 0.05 ? '—' : fmt(readouts.tp) + 's'], ['Rise time 10–90%', readouts.tr === null ? '—' : fmt(readouts.tr) + 's'], ['Settling 2%', fmt(readouts.ts2) + 's']].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--mute)' }}>{k}</div>
                <div style={{ fontFamily: 'var(--f-head)', fontWeight: 600, fontSize: 26, marginTop: 4, letterSpacing: '-0.01em' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ border: '1px solid var(--line)', borderRadius: 14, background: 'var(--card)', padding: '22px 24px', marginTop: 28 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <span style={{ fontWeight: 500, fontSize: 14 }}>Damping ratio &nbsp;<em style={{ fontFamily: 'var(--f-head)', fontStyle: 'italic', color: 'var(--mute)', fontWeight: 400 }}>ζ</em></span>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--accent)' }}>{zeta.toFixed(2)}</span>
          </div>
          <input type="range" min="0" max="2" step="0.01" value={zeta} onChange={e => setZeta(parseFloat(e.target.value))} style={{ WebkitAppearance: 'none', appearance: 'none', width: '100%', height: 2, background: 'var(--line)', outline: 'none' }} />
          <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--mute)', marginTop: 12 }}>Regime: {regime}</div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <span style={{ fontWeight: 500, fontSize: 14 }}>Natural frequency &nbsp;<em style={{ fontFamily: 'var(--f-head)', fontStyle: 'italic', color: 'var(--mute)', fontWeight: 400 }}>ωₙ</em></span>
            <span style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: 'var(--accent)' }}>{wn.toFixed(1)} rad/s</span>
          </div>
          <input type="range" min="0.5" max="6" step="0.1" value={wn} onChange={e => setWn(parseFloat(e.target.value))} style={{ WebkitAppearance: 'none', appearance: 'none', width: '100%', height: 2, background: 'var(--line)', outline: 'none' }} />
        </div>
      </div>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--mute)', margin: '44px 0 16px' }}>What to notice</div>
      <div style={{ fontSize: 16, lineHeight: 1.6 }}>
        <p style={{ margin: '0 0 12px', maxWidth: '64ch' }}>As ζ drops below 1 the poles become a complex-conjugate pair and the response overshoots and rings. At ζ = 1 (critically damped) the response is the fastest possible with no overshoot. Above ζ = 1 the poles split onto the real axis and the response becomes sluggish.</p>
        <p style={{ margin: 0, maxWidth: '64ch' }}>ωₙ scales the speed of everything: larger ωₙ pushes the poles further from the origin, shrinking rise and settling times while leaving the overshoot percentage unchanged.</p>
      </div>
    </div>
  );
}

window.StepResponseDemo = StepResponseDemo;
