#!/bin/sh
# Builds the week-5 demos and copies each single-file bundle into ../../viz/.
# Each entry is built on its own: a joint build would split React into a shared
# chunk that html-inline cannot inline.
set -e
cd "$(dirname "$0")"
rm -rf dist .parcel-cache
for pair in conv:convolution sine:sine-machine est:s-domain; do
  entry=${pair%%:*}
  out=${pair#*:}
  npx parcel build "$entry.html" --dist-dir "dist/$entry" --no-source-maps --no-cache
  npx html-inline "dist/$entry/$entry.html" > "../../viz/week-05-$out.html"
done
ls -lh ../../viz/week-05-*.html
