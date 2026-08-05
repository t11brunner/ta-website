const { useState } = React;

const YEAR = 2026;
const WEEKS = [
  {n:1, t:"Introduction & System Modeling", date:"Aug 31", ex:false, viz:[], hw:{t:"Problem Set 1 — Modeling", due:"Sep 11", ps:false, sol:false}},
  {n:2, t:"Laplace Transforms Review", date:"Sep 7", ex:false, viz:[{k:"laplace", label:"Laplace pole map"}]},
  {n:3, t:"Transfer Functions", date:"Sep 14", ex:false, viz:[{k:"tfbuild", label:"Transfer-function builder"}], hw:{t:"Problem Set 2 — Transfer Functions", due:"Sep 25", ps:false, sol:false}},
  {n:4, t:"Block Diagrams & Signal Flow", date:"Sep 21", ex:false, viz:[{k:"block", label:"Block-diagram reduction"}]},
  {n:5, t:"Time-Domain Response", date:"Sep 28", ex:true, viz:[{k:"step2", label:"Second-order step response", live:true},{k:"impulse", label:"Step vs impulse"}], hw:{t:"Problem Set 3 — Time Response", due:"Oct 2", ps:true, sol:false}},
  {n:6, t:"Stability & Routh–Hurwitz", date:"Oct 5", ex:false, viz:[{k:"routh", label:"Routh array explorer"}]},
  {n:7, t:"Root Locus", date:"Oct 12", ex:false, viz:[{k:"rlocus", label:"Root-locus plot"},{k:"poledrag", label:"Pole / zero drag"}], hw:{t:"Problem Set 4 — Root Locus", due:"Oct 16", ps:false, sol:false}},
  {n:8, t:"Frequency Response & Bode", date:"Oct 19", ex:false, viz:[{k:"bode", label:"Bode plot"}], hw:{t:"Problem Set 5 — Frequency Domain", due:"Oct 30", ps:false, sol:false}},
  {n:9, t:"Nyquist Criterion", date:"Oct 26", ex:false, viz:[]},
  {n:10, t:"PID Controller Design", date:"Nov 2", ex:false, viz:[{k:"pid", label:"PID tuner"}]},
];

function Back({ onClick, children }) {
  return <div onClick={onClick} style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--mute)', cursor: 'pointer', display: 'inline-flex', gap: 7, marginBottom: 28, alignItems: 'center' }}
    onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--mute)'}>{children}</div>;
}

function WeeksScreen({ Row, Tag, SectionHeader, onOpenWeek }) {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <SectionHeader title="Weekly material" />
      <div>
        {WEEKS.map(w => (
          <Row key={w.n} number={String(w.n).padStart(2, '0')} title={w.t} meta={`LECTURE · ${w.date.toUpperCase()}, ${YEAR}`}
            tags={<React.Fragment>
              <Tag tone={w.ex ? 'accent' : 'dim'}>{w.ex ? 'slides ↓' : 'soon'}</Tag>
              {w.viz.length ? <Tag>{w.viz.length} viz</Tag> : null}
              {w.hw ? <Tag>PS due</Tag> : null}
            </React.Fragment>}
            onClick={() => onOpenWeek(w.n)} />
        ))}
      </div>
    </div>
  );
}

function WeekDetailScreen({ week, ActionCard, PlaceholderMedia, onBack, onOpenViz }) {
  const w = week; const pad = String(w.n).padStart(2, '0');
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <Back onClick={onBack}>← all weeks</Back>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent)' }}>WEEK {pad}</div>
      <div style={{ margin: '14px 0 22px' }}>
        <h2 style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 40, margin: 0, letterSpacing: '-0.025em' }}>{w.t}</h2>
      </div>
      <div style={{ display: 'flex', gap: 26, flexWrap: 'wrap', fontSize: 13, color: 'var(--mute)', paddingBottom: 22, borderBottom: '1px solid var(--line-soft)' }}>
        <span><b style={{ color: 'var(--ink)', fontWeight: 500 }}>{w.date}, {YEAR}</b> &nbsp;exercise session</span>
      </div>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--mute)', margin: '44px 0 16px' }}>Downloads</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, margin: '28px 0 8px' }}>
        <ActionCard badge="EX" label="Exercise slides" name={`CS301-week-${pad}-exercise.pdf`} status={w.ex ? 'available · click to download' : 'posts on session day'} available={w.ex} href={`slides/week-${pad}-exercise.pdf`} downloadName={`CS301-week-${pad}-exercise.pdf`} />
        {w.hw
          ? <ActionCard badge="PS" label="Problem set" name={`CS301-week-${pad}-problemset.pdf`} status={w.hw.ps ? `due ${w.hw.due}` : `due ${w.hw.due} · posting soon`} available={w.hw.ps} href={`slides/week-${pad}-problemset.pdf`} downloadName={`CS301-week-${pad}-problemset.pdf`} />
          : <ActionCard badge="PS" label="Problem set" name="" status="no problem set this week" available={false} />}
        {w.hw
          ? <ActionCard badge="SOL" label="Solutions" name={`CS301-week-${pad}-solutions.pdf`} status={w.hw.sol ? 'available · click to download' : 'posts after due date'} available={w.hw.sol} href={`slides/week-${pad}-solutions.pdf`} downloadName={`CS301-week-${pad}-solutions.pdf`} />
          : <ActionCard badge="SOL" label="Solutions" name="" status="no problem set this week" available={false} />}
      </div>
      {w.viz.length > 0 && <React.Fragment>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--mute)', margin: '44px 0 16px' }}>Visualisations for this week</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
          {w.viz.map(v => (
            <div key={v.k} style={{ cursor: 'pointer' }} onClick={() => onOpenViz(v, w)}>
              <PlaceholderMedia label={v.label.toLowerCase()} height={130} style={{ marginBottom: 12, borderRadius: 0 }} />
              <div style={{ fontFamily: 'var(--f-head)', fontWeight: 600, fontSize: 16, letterSpacing: '-0.01em' }}>{v.label}</div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--mute)', marginTop: 5 }}>{v.live ? '● interactive' : '○ in development'}</div>
            </div>
          ))}
        </div>
      </React.Fragment>}
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--mute)', margin: '44px 0 16px' }}>Reading & notes</div>
      <p style={{ fontSize: 16, lineHeight: 1.6, maxWidth: '62ch' }}>Lecture notes and suggested textbook sections will appear here. For now this space shows where per-week supplementary material lives.</p>
    </div>
  );
}

function VizGalleryScreen({ PlaceholderMedia, SectionHeader, onOpenViz }) {
  const all = []; WEEKS.forEach(w => w.viz.forEach(v => all.push({ v, w })));
  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <SectionHeader title="Visualisations" note="Interactive demos that accompany the lectures, grouped by topic. Each one also appears on the page of the week it belongs to. The second-order step response below is the first live demo — the rest follow the same template." />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 28 }}>
        {all.map(({ v, w }) => (
          <div key={v.k} style={{ cursor: 'pointer' }} onClick={() => onOpenViz(v, w)}>
            <PlaceholderMedia label={v.label.toLowerCase()} height={130} style={{ marginBottom: 12, borderRadius: 0 }} />
            <div style={{ fontFamily: 'var(--f-head)', fontWeight: 600, fontSize: 16, lineHeight: 1.2, letterSpacing: '-0.01em' }}>{v.label}</div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--mute)', marginTop: 5, letterSpacing: '.04em' }}>WEEK {String(w.n).padStart(2, '0')} · {w.t}</div>
            <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, marginTop: 6, letterSpacing: '.04em', color: v.live ? 'var(--accent)' : 'var(--mute)' }}>{v.live ? '● interactive' : '○ in development'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VizDetailScreen({ viz, week, PlaceholderMedia, onBack }) {
  const isLive = viz.v.k === 'step2';
  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <Back onClick={onBack}>← all visualisations</Back>
      <div style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--mute)' }}>WEEK {String(week.n).padStart(2, '0')} · VISUALISATION</div>
      <h2 style={{ fontFamily: 'var(--f-head)', fontWeight: 600, fontSize: 28, margin: '12px 0 14px', letterSpacing: '-0.02em' }}>{viz.v.label}</h2>
      {isLive ? React.createElement(window.StepResponseDemo) : (
        <React.Fragment>
          <PlaceholderMedia label="visualisation in development — coming during the semester" height={280} />
          <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.7, marginTop: 22, maxWidth: '52ch' }}>This demo will be built using the same interactive template as the second-order step response. Check back when the relevant week goes live.</p>
        </React.Fragment>
      )}
    </div>
  );
}

function TaSiteApp() {
  const { NavPills, Row, Tag, ActionCard, PlaceholderMedia, SectionHeader } = window.ETHTADesignSystem_b75858;
  const [screen, setScreen] = useState('weeks');
  const [openWeekN, setOpenWeekN] = useState(null);
  const [openViz, setOpenViz] = useState(null);

  const week = WEEKS.find(w => w.n === openWeekN);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--paper)', padding: '0 24px 100px', fontFamily: 'var(--f-body)' }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '100px 0 0', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--f-head)', fontWeight: 700, fontSize: 56, lineHeight: 1.05, margin: 0, letterSpacing: '-0.02em' }}>Control Systems&nbsp;I</h1>
        <div style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--mute)', letterSpacing: '.08em', marginTop: 14 }}>tibrunner@ethz.ch</div>
      </div>
      <div style={{ margin: '44px auto 56px' }}>
        <NavPills items={[{ key: 'weeks', label: 'weeks' }, { key: 'viz', label: 'visualisations' }]} active={screen === 'week' ? 'weeks' : screen === 'viz-detail' ? 'viz' : screen}
          onChange={k => setScreen(k)} />
      </div>
      {screen === 'weeks' && <WeeksScreen Row={Row} Tag={Tag} SectionHeader={SectionHeader} onOpenWeek={n => { setOpenWeekN(n); setScreen('week'); }} />}
      {screen === 'week' && week && <WeekDetailScreen week={week} ActionCard={ActionCard} PlaceholderMedia={PlaceholderMedia}
        onBack={() => setScreen('weeks')} onOpenViz={(v, w) => { setOpenViz({ v, w }); setScreen('viz-detail'); }} />}
      {screen === 'viz' && <VizGalleryScreen PlaceholderMedia={PlaceholderMedia} SectionHeader={SectionHeader} onOpenViz={(v, w) => { setOpenViz({ v, w }); setScreen('viz-detail'); }} />}
      {screen === 'viz-detail' && openViz && <VizDetailScreen viz={openViz} week={openViz.w} PlaceholderMedia={PlaceholderMedia} onBack={() => setScreen('viz')} />}
      <footer style={{ maxWidth: 760, margin: '100px auto 0', fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--mute)', borderTop: '1px solid var(--line)', paddingTop: 22, letterSpacing: '.14em' }}>CONTROL SYSTEMS I · TA SITE · FS26 · HOSTED ON GITHUB PAGES</footer>
    </div>
  );
}

window.TaSiteApp = TaSiteApp;
