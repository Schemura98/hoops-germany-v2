#!/bin/sh
# Mutationsmatrix für den Wiederkehr-Quote-Wächter. Jede Mutation EINZELN:
# Ablage: scripts/messungen/ (Roadmap 32 e: Messskripte einchecken). Läuft aus jedem
# Arbeitsbaum: patchen → Spec laufen → Ergebnis notieren → Original wiederherstellen.
cd "$(dirname "$0")/../.." || exit 1
LIB=lib/wiederkehrRate.mjs
SKRIPT=scripts/wiederkehr-rate.mjs
cp "$LIB" tmp/_wq_lib_orig.js
cp "$SKRIPT" tmp/_wq_skript_orig.mjs

lauf() { # $1=name  $2=datei  $3=perl-substitution
  perl -0pi -e "$3" "$2"
  if ! cmp -s "$2" "tmp/_wq_lib_orig.js" && ! cmp -s "$2" "tmp/_wq_skript_orig.mjs"; then :; else
    echo "$1: MUTATION GRIFF NICHT (Datei unveraendert) — Matrix ungueltig"; fi
  ERG=$(E2E_PORT=3210 E2E_BUILD=aus npx playwright test -c tests/e2e/playwright.config.mjs tests/e2e/wiederkehr-rate.spec.mjs 2>&1 | grep -E "[0-9]+ (passed|failed)" | tr '\n' ' ')
  echo "$1 → $ERG"
  cp tmp/_wq_lib_orig.js "$LIB"
  cp tmp/_wq_skript_orig.mjs "$SKRIPT"
}

lauf "M01 UTC-Wochen statt Berlin        " "$LIB" 's/(berlinMontagIso\(zeitpunkt\) \{\n  const ms = [^\n]*\n)  const z = berlinTeile\(ms\);/$1  const d0 = new Date(ms); const z = { j: d0.getUTCFullYear(), m: d0.getUTCMonth() + 1, t: d0.getUTCDate() };/s'
lauf "M02 1 statt 2 aktive Wochen        " "$LIB" 's/MIN_AKTIVE_WOCHEN = 2/MIN_AKTIVE_WOCHEN = 1/'
lauf "M03 Admin-Ausschluss entfernt      " "$LIB" 's/const istAdmin = Boolean\(s\.isTeamAdmin\) \|\| Boolean\(s\.teamAdminOf\);/const istAdmin = false;/'
lauf "M04 NUR_ECHT-Filter entfernt       " "$SKRIPT" 's/\{ \.\.\.NUR_ECHT, createdAt/{ createdAt/'
lauf "M05 Leerwochen zaehlen mit         " "$LIB" 's/wertungsSet\.has\(w\) && w > regWoche/w > regWoche/'
lauf "M06 own_stats_notified zaehlt      " "$LIB" 's/    if \(e\.eventType === AUSGESCHLOSSENER_EVENTTYP\) return false;\n//s'
lauf "M07 Registrierungswoche zaehlt     " "$LIB" 's/wertungsSet\.has\(w\) && w > regWoche/wertungsSet.has(w) \&\& w >= regWoche/'
lauf "M08 Prozent auch unter n=20        " "$LIB" 's/const prozent = y >= MIN_N/const prozent = true/'
lauf "M09 3 statt 4 moegliche Wochen     " "$LIB" 's/MIN_MOEGLICHE_WOCHEN = 4/MIN_MOEGLICHE_WOCHEN = 3/'
lauf "M10 Messstrecken-Schranke entfernt " "$LIB" 's/if \(datenstandMs < endeErsteWocheMs\) \{/if (false) {/'
lauf "M11 Kohorten-Schranke entfernt     " "$LIB" 's/if \(!Array\.isArray\(spieler\) \|\| spieler\.length === 0\) \{/if (false) {/'
lauf "M12 Kalender-Pruefung stillgelegt  " "$LIB" 's/export function pruefeKalender\(kalender\) \{/export function pruefeKalender(kalender) { return;/'
lauf "M13 Vorbedingungs-Schwelle 50->10  " "$LIB" 's/m3Prozent < 50 \? /m3Prozent < 10 ? /'
lauf "M14 Ampel trotz Zukunfts-Stichtag  " "$LIB" 's/stichtagIso === AMPEL_STICHTAG && jetzt >= stichtagMs;/stichtagIso === AMPEL_STICHTAG;/'
lauf "M15 Ampel an jedem Stichtag        " "$LIB" 's/stichtagIso === AMPEL_STICHTAG && jetzt >= stichtagMs;/jetzt >= stichtagMs;/'
lauf "M16 8. Spielwoche zaehlt in Ampel  " "$LIB" 's/w\.spielwoche && w\.montag < stichtagIso/w.spielwoche \&\& w.montag <= stichtagIso/'

rm -f tmp/_wq_lib_orig.js tmp/_wq_skript_orig.mjs
echo "FERTIG — Originale wiederhergestellt."
