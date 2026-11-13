#!/bin/sh
# Builds the week-5, week-8 and week-9 demos and copies each single-file bundle into ../../viz/.
# Each entry is built on its own: a joint build would split React into a shared
# chunk that html-inline cannot inline.
set -e
cd "$(dirname "$0")"
rm -rf dist .parcel-cache
for pair in conv:week-05-convolution sine:week-05-sine-machine est:week-05-s-domain sum:week-05-exp-sum spec:week-08-pole-specs bode:week-09-bode-sketch pz:week-09-pole-zero-arrows; do
  entry=${pair%%:*}
  out=${pair#*:}
  npx parcel build "$entry.html" --dist-dir "dist/$entry" --no-source-maps --no-cache
  npx html-inline "dist/$entry/$entry.html" > "../../viz/$out.html"
done
ls -lh ../../viz/week-0[589]-*.html
