#!/bin/sh
# Prueft sprachunabhaengig, ob auf einem Port wirklich ein Server LAUSCHT.
#
# Projektunabhaengig: das Skript hat keinerlei Pfad- oder Projektannahme und ist
# aus jedem Verzeichnis und jedem Projekt heraus aufrufbar - auch per absolutem
# Pfad aus einem anderen Repo heraus.
#
# Aufruf:  sh scripts/port-frei.sh [PORT]        Vorgabe: 3000
# Exit 0 = frei, Exit 1 = belegt (bricht `&&`-Ketten ab, bevor ein Build startet)
# Exit 2 = nicht pruefbar (ungueltiger Port oder kein passendes Werkzeug)
#
# Beispiel:  sh scripts/port-frei.sh && npm run build
#
# Spalten (netstat -ano, Windows): 1 Proto | 2 lokale Adresse | 3 Gegenstelle | 4 Zustand | 5 PID
#
# Drei Fallen, alle real erlebt (die ersten beiden 12.08.2026, s. docs/CHRONIK.md):
#  - `grep LISTEN` scheitert: deutsches Windows schreibt "ABHOEREN".
#  - Zustandstext ignorieren reicht nicht: WARTEND/FIN_WARTEN_2-Reste sehen sonst
#    wie ein Listener aus. Merkmal eines Listeners ist die Gegenstelle 0.0.0.0:0 / [::]:0.
#  - Beim Umzug aus tmp/ (15.08.2026) aufgefallen: `netstat -ano` bedeutet unter
#    Linux etwas ANDERES als unter Windows (-o = Timer statt PID, andere Spalten).
#    Unveraendert uebernommen haette das Skript dort still "FREI" gemeldet, also
#    genau den Fehler gedeckt, gegen den es gebaut wurde. Daher die OS-Weiche.

PORT="${1:-3000}"

case "$PORT" in
  ''|*[!0-9]*) echo "Ungueltiger Port: $PORT" >&2; exit 2 ;;
esac

pid=""
case "$(uname -s)" in
  MINGW*|MSYS*|CYGWIN*|Windows_NT)
    pid=$(netstat -ano \
      | awk -v muster=":$PORT\$" '$2 ~ muster && ($3 == "0.0.0.0:0" || $3 == "[::]:0") {print $5; exit}')
    ;;
  *)
    if command -v ss >/dev/null 2>&1; then
      pid=$(ss -ltnHp "sport = :$PORT" 2>/dev/null | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | head -1)
      # ss zeigt fremde PIDs nur mit Rechten; Listener ohne PID trotzdem als belegt melden
      if [ -z "$pid" ] && [ -n "$(ss -ltnH "sport = :$PORT" 2>/dev/null)" ]; then pid="unbekannt"; fi
    elif command -v lsof >/dev/null 2>&1; then
      pid=$(lsof -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null | head -1)
    else
      echo "Weder ss noch lsof vorhanden - Port $PORT nicht pruefbar" >&2
      exit 2
    fi
    ;;
esac

if [ -n "$pid" ]; then echo "Port $PORT BELEGT durch PID $pid"; exit 1; fi
echo "Port $PORT FREI"; exit 0
