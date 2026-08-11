#!/bin/sh
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
hole() { # $1=Familie-URL-Teil  $2=Zieldatei
  url=$(curl -s -m 25 -A "$UA" "https://fonts.googleapis.com/css2?family=$1:wght@100..900&display=swap" \
        | awk '/latin *\*\//{flag=1} flag && /url\(/ {match($0,/https:[^)]*/); print substr($0,RSTART,RLENGTH); exit}')
  [ -z "$url" ] && { echo "keine latin-URL fuer $1"; return 1; }
  curl -s -m 40 -A "$UA" "$url" -o "$2" && echo "$2  $(stat -c%s "$2") Bytes"
}
hole "Geist" public/fonts/geist-latin.woff2
hole "Geist+Mono" public/fonts/geist-mono-latin.woff2
