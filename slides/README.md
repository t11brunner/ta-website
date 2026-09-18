# Slides

Drop each week's PDFs here, named by week number. Up to three per week:

```
slides/week-01-exercise.pdf          # "Slides" button
slides/week-01-exercise-gaps.pdf     # "Slides gaps" button
slides/week-01-exercise-filled.pdf   # "Slides filled" button
slides/week-02-exercise.pdf
...
```

Then, in the `WEEKS` array in `../index.html`, set the matching flag(s) —
`ex:true`, `gaps:true`, `filled:true` — on that week. Each button is
independent: a week can have any subset of the three files/flags (e.g.
post slides + gaps first, add filled slides after the exercise session).

The site serves the files as `CS301-week-NN-exercise.pdf` /
`CS301-week-NN-exercise-gaps.pdf` / `CS301-week-NN-exercise-filled.pdf`.
