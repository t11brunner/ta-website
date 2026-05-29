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

All content lives in the `WEEKS`, `HW`, and `LINKS` arrays near the top of the
`<script>` block in `index.html` (look for the **EDITING GUIDE** comment).

### Posting slides
1. Export your slides to PDF.
2. Save it as `slides/week-05.pdf` (two-digit week number).
3. In `index.html`, set `pdf:true` on that week.
4. Commit & push. The week's download button activates automatically.

### Adding a visualisation
1. Add `{k:"unique-key", label:"Demo name"}` to that week's `viz:[ ]`.
2. Build the demo (see the second-order step-response demo as the template).
3. Set `live:true` once it's ready.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The whole site. Edit content arrays here. |
| `slides/` | Drop weekly `week-NN.pdf` files here. |
| `Control Systems TA Site.html` | Design reference (accent/font explorer) — not deployed. |
