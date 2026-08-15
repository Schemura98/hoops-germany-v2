#!/bin/sh
# Laedt Google-Fonts als woff2 (nur latin-Subset) in ein Projekt.
#
# Projektuebergreifend: Ziel ist standardmaessig `public/fonts` RELATIV ZUM
# AKTUELLEN ARBEITSVERZEICHNIS - bewusst nicht relativ zum Skriptort. Aus einem
# anderen Projekt heraus aufgerufen landet die Schrift also in JENEM Projekt,
# auch wenn das Skript per absolutem Pfad aus diesem Repo gestartet wird.
#
# Aufruf:
#   sh scripts/fetch-fonts.sh                       Geist + Geist Mono nach ./public/fonts
#   sh scripts/fetch-fonts.sh --dry                 nur zeigen, nichts herunterladen
#   sh scripts/fetch-fonts.sh public/fonts Inter    eigenes Ziel + eigene Familie
#   sh scripts/fetch-fonts.sh assets "Big+Shoulders+Display" Inter
#
# Erstes Argument ist IMMER der Zielordner, danach beliebig viele Familien in
# Google-Schreibweise (Leerzeichen als "+"). Der Dateiname wird aus der Familie
# abgeleitet: "Geist+Mono" -> geist-mono-latin.woff2
#
# Hintergrund: Next 14.2.35 kennt Geist nicht im Font-Katalog, deshalb liegen die
# Dateien selbst gehostet in public/fonts/ und werden ueber next/font/local
# eingebunden (lib/fonts.js). Dieses Skript ist die einzige Anleitung, wie sie
# dorthin gekommen sind - es zu verlieren hiesse, das nicht reproduzieren zu koennen.

UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"

DRY=0
if [ "$1" = "--dry" ]; then DRY=1; shift; fi

ZIEL="public/fonts"
if [ $# -gt 0 ]; then ZIEL="$1"; shift; fi
if [ $# -eq 0 ]; then set -- "Geist" "Geist+Mono"; fi

if [ "$DRY" -eq 0 ]; then
  mkdir -p "$ZIEL" || { echo "Zielordner nicht anlegbar: $ZIEL" >&2; exit 2; }
fi
echo "Ziel: $ZIEL  (aus $(pwd))"

fehler=0

hole() { # $1 = Familie in Google-Schreibweise
  fam="$1"
  datei=$(printf '%s' "$fam" | tr 'A-Z' 'a-z' | tr '+' '-')
  ziel="$ZIEL/$datei-latin.woff2"

  url=$(curl -s -m 25 -A "$UA" \
        "https://fonts.googleapis.com/css2?family=$fam:wght@100..900&display=swap" \
        | awk '/latin *\*\//{flag=1} flag && /url\(/ {match($0,/https:[^)]*/); print substr($0,RSTART,RLENGTH); exit}')

  if [ -z "$url" ]; then
    echo "  $fam: keine latin-URL gefunden (Familienname falsch geschrieben?)" >&2
    fehler=1
    return 1
  fi

  if [ "$DRY" -eq 1 ]; then
    vorhanden=""
    [ -f "$ziel" ] && vorhanden="  (vorhanden, wuerde ueberschrieben)"
    echo "  $fam -> $ziel$vorhanden"
    echo "      $url"
    return 0
  fi

  [ -f "$ziel" ] && echo "  $fam: $ziel wird ueberschrieben"
  if curl -s -m 40 -A "$UA" "$url" -o "$ziel"; then
    echo "  $fam -> $ziel  $(wc -c < "$ziel" | tr -d ' ') Bytes"
  else
    echo "  $fam: Download fehlgeschlagen" >&2
    fehler=1
    return 1
  fi
}

for fam in "$@"; do hole "$fam"; done

if [ "$DRY" -eq 1 ]; then echo "(--dry: nichts geschrieben)"; fi
exit $fehler
