# TA Site UI kit

Click-through recreation of the Control Systems I TA website (source: t11brunner/ta-website). Screens: weekly material index, week detail (downloads + per-week visualisations), visualisation gallery, and the live second-order step-response demo (draggable ζ / ωₙ sliders, canvas-drawn step response + s-plane).

Composed entirely from design-system primitives (`NavPills`, `Row`, `Tag`, `ActionCard`, `PlaceholderMedia`, `SectionHeader`) — no bespoke styling beyond the interactive canvas demo, which is a straight port of the source site's simulation code.

Files: `index.html` (mount), `App.jsx` (screens + state), `StepResponseDemo.jsx` (canvas simulation).
