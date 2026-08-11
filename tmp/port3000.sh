#!/bin/sh
# Prueft sprachunabhaengig, ob auf Port 3000 wirklich ein Server LAUSCHT.
# Exit 1 = belegt (bricht `&&`-Ketten ab), Exit 0 = frei.
# Spalten (netstat -ano): 1 Proto | 2 lokale Adresse | 3 Gegenstelle | 4 Zustand | 5 PID
# Zwei Fallen, beide selbst erlebt (12.08.2026):
#  - `grep LISTEN` scheitert: deutsches Windows schreibt "ABHOEREN".
#  - Zustandstext ignorieren reicht nicht: WARTEND/FIN_WARTEN_2-Reste sehen sonst
#    wie ein Listener aus. Merkmal eines Listeners ist die Gegenstelle 0.0.0.0:0 / [::]:0.
pid=$(netstat -ano | awk '$2 ~ /:3000$/ && ($3 == "0.0.0.0:0" || $3 == "[::]:0") {print $5; exit}')
if [ -n "$pid" ]; then echo "BELEGT durch PID $pid"; exit 1; fi
echo "FREI"; exit 0
