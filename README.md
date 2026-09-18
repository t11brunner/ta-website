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
with three buttons — "Slides", "Slides gaps", "Slides filled" — each backed
by its own flag (`ex`, `gaps`, `filled`) and its own PDF, so any subset can
go live independently (e.g. post slides + gaps on Monday, filled slides
after the exercise session). There are no per-week pages and no problem
sets for now.

No build step: everything is static HTML/PDF/JS, so posting material is
just "add the file → flip a flag → commit & push". You don't need Claude
for this — any editor and `git` work fine.

### Posting slides
1. Export your slides to PDF (and the gaps/handout and/or filled-in
   version, if you have them).
2. Save them into `slides/`, named by two-digit week number:
   - `slides/week-05-exercise.pdf` → lights up "Slides"
   - `slides/week-05-exercise-gaps.pdf` → lights up "Slides gaps"
   - `slides/week-05-exercise-filled.pdf` → lights up "Slides filled"
3. In `index.html`, set the matching flag(s) — `ex:true`, `gaps:true`,
   `filled:true` — to `true` on that week's entry in `WEEKS`.
4. Commit & push. Only the buttons whose file + flag are both set turn on;
   the rest stay dim automatically. See `slides/README.md` for the
   filename cheat sheet.

### Posting additional material (lecture notes, summary sheets, ...)
This is the "Additional material" page, backed by the `RESOURCES` array
right below `WEEKS` in `index.html`.
1. Save the file into `resources/`.
2. Add `{ title: "...", href: "resources/your-file.pdf", dlname: "..." }`
   to `RESOURCES`.
3. Commit & push. See `resources/README.md`.

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
| `slides/` | Weekly `week-NN-exercise[-gaps\|-filled].pdf` files. |
| `resources/` | Files listed on the "Additional material" page. |
