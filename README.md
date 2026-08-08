# Control Systems 301 — TA Site

A static teaching-assistant website for **Control Systems 301 (Fall 2026)**.
Weekly lecture slides (PDF) plus interactive visualisations. Built as a single
`index.html` with no build step — just edit and push.

## Hosting on GitHub Pages

1. Create a repo (e.g. `cs301-ta`) and push these files to the `main` branch.
2. In the repo: **Settings → Pages → Source → Deploy from a branch**, pick
   `main` / `root`, save.
3. The site goes live at `https://<your-username>.github.io/cs301-ta/`.

Because everything is static (HTML + PDFs + JS visualisations), no server is
needed. To use a custom domain later, add it under Settings → Pages.

## Updating content each week

All content lives in the `WEEKS` array near the top of the `<script>` block
in `index.html` (look for the **EDITING GUIDE** comment). Each week is a row
with two buttons, "Slides" and "Slides gaps" — there are no per-week pages
and no problem sets for now.

### Posting slides
1. Export your slides to PDF, plus the gaps/handout version.
2. Save them as `slides/week-05-exercise.pdf` and
   `slides/week-05-exercise-gaps.pdf` (two-digit week number).
3. In `index.html`, set `ex:true` on that week.
4. Commit & push. Both of the week's buttons activate automatically.

### Adding a visualisation
Visualisations live only on the Visualisations page/gallery, not per week.
1. Add `{k:"unique-key", label:"Demo name"}` to that week's `viz:[ ]`.
2. Build the demo (see the second-order step-response or transfer-function
   demos as the template).
3. Set `live:true` once it's ready.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The whole site. Edit content arrays here. |
| `slides/` | Drop weekly `week-NN-exercise.pdf` / `week-NN-exercise-gaps.pdf` files here. |
| `Control Systems TA Site.html` | Design reference (accent/font explorer) — not deployed. |
