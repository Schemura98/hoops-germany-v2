#!/bin/sh
# Holt die Segment-Schrift der Anzeigetafel (DSEG7 Classic Bold) samt Lizenz
# aus dem offiziellen Release des Schriftprojekts von keshikan (SIL OFL 1.1).
# Ziel: public/fonts/ relativ zum Arbeitsverzeichnis (wie fetch-fonts.sh).
#   sh scripts/fetch-segment-font.sh          laedt und legt ab
#   sh scripts/fetch-segment-font.sh --dry    zeigt nur, was passieren wuerde
URL="https://github.com/keshikan/DSEG/releases/download/v0.46/fonts-DSEG_v046.zip"
if [ "$1" = "--dry" ]; then
  echo "Wuerde laden: $URL"
  echo "Wuerde ablegen: public/fonts/DSEG7Classic-Bold.woff2 + DSEG-LICENSE.txt"
  exit 0
fi
TMP=$(mktemp -d) || exit 2
curl -sL -m 60 -o "$TMP/dseg.zip" "$URL" || { echo "Download fehlgeschlagen" >&2; exit 1; }
unzip -o -q "$TMP/dseg.zip" -d "$TMP" || { echo "Entpacken fehlgeschlagen" >&2; exit 1; }
mkdir -p public/fonts
cp "$TMP/fonts-DSEG_v046/DSEG7-Classic/DSEG7Classic-Bold.woff2" public/fonts/ || exit 1
cp "$TMP/fonts-DSEG_v046/DSEG-LICENSE.txt" public/fonts/ || exit 1
rm -rf "$TMP"
echo "OK: public/fonts/DSEG7Classic-Bold.woff2 (+ DSEG-LICENSE.txt)"
