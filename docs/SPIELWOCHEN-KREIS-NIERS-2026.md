# Spielwochen-Kalender Kreis Niers — Messfenster 28.09.2026 bis 20.12.2026

**Recherche vom 23.08.2026** für die Wiederkehr-Messung
(`docs/WIEDERKEHR-RATE-DEFINITION-2026-08-23.md`, §2.4). Maschinenlesbare Fassung
für den Messjob: `lib/spielwochenNiers2026.mjs` — beide Dateien müssen inhaltsgleich
bleiben; wer eine ändert, ändert die andere mit.

## Datengrundlage — gemessen, nicht angenommen

- **Spielplan:** Kreisliga Herren „KLH Niers" 2026/27 (Liganr. 507200, Liga-ID 56045),
  basketball-bund.net (TeamSL). Vollständiger Plan über die TeamSL-Schnittstelle
  abgerufen: https://www.basketball-bund.net/rest/competition/spielplan/id/56045?spieltag=0
  (Abruf 23.08.2026). Gegengeprüft an der normalen Spielplan-Seite
  https://www.basketball-bund.net/index.jsp?Action=101&liga_id=56045 (Abruf 23.08.2026,
  „72 Treffer insgesamt", erste Seite terminidentisch mit der Schnittstelle).
- ✅ **Der Spielplan ist VOLLSTÄNDIG, das ist Arithmetik:** 9 Teams in einer Doppelrunde
  ergeben 9 × 8 = **72 Spiele — und genau 72 sind angesetzt** (03.10.2026 bis 25.04.2027,
  Spieltage 1–18). Es fehlt also kein Spiel; die Leerwochen unten sind vom Verband so
  gesetzt, nicht „noch nicht eingetragen". Kein Spiel trägt zum Abrufdatum eine
  Absage-/Verzicht-Markierung.
- **Herbstferien NRW 2026: Samstag 17.10.2026 bis Samstag 31.10.2026** — offizielle
  Ferienordnung des Schulministeriums NRW,
  https://www.schulministerium.nrw/ferienordnung-fuer-nordrhein-westfalen-fuer-die-schuljahre-bis-202930
  (Abruf 23.08.2026). Die Weihnachtsferien beginnen erst Mi 23.12.2026 und liegen damit
  **nach** dem Messfenster.
- **Wochendefinition:** Kalenderwoche Montag–Sonntag, benannt nach dem ISO-Datum des
  Montags (identisch mit der Definition in §2.3, Zeitzone Europe/Berlin).

⚠️ **Stand heute (23.08.2026), vor Messbeginn erneut prüfen:** Der Plan ist vollständig,
aber Verlegungen einzelner Spiele bleiben bis zum Saisonstart möglich. §2.4 der
Definition verlangt ohnehin: Nach dem 14.09. wird die Liste nur noch bei einer
Verbands-Verlegung geändert, mit Protokollzeile in der Definitionsdatei.

## Der Kalender — 12 Wochen, davon 8 Spielwochen

| Woche (Mo) | KW | Spielwoche | KLH-Termine | Begründung | Quelle | Abruf |
|---|---|---|---|---|---|---|
| 2026-09-28 | 40 | **JA** | 4 | Spieltag 1: Sa 03.10. (1 Spiel) + So 04.10. (3 Spiele). Der Sa 03.10. ist Tag der Deutschen Einheit — das Spiel ist trotzdem angesetzt (gemessen, keine Vermutung). | TeamSL, Liga-ID 56045 (REST-Abruf s. o.) | 23.08.2026 |
| 2026-10-05 | 41 | **JA** | 4 | Spieltag 2: Fr 09.10. (1) + Sa 10.10. (1) + So 11.10. (2). | TeamSL, Liga-ID 56045 | 23.08.2026 |
| 2026-10-12 | 42 | **nein** | 0 | Kein KLH-Spieltermin in dieser Woche laut TeamSL. *Interpretation:* Das Wochenende 17./18.10. sind bereits die ersten Herbstferientage — die Woche liegt aber NICHT komplett in den Ferien (Ferienbeginn erst Sa 17.10.), der tragende Beleg ist der leere Spielplan. | TeamSL, Liga-ID 56045 · Ferien: schulministerium.nrw (s. o.) | 23.08.2026 |
| 2026-10-19 | 43 | **nein** | 0 | Kein KLH-Spieltermin laut TeamSL; die Woche liegt **komplett** in den NRW-Herbstferien (17.10.–31.10.). | TeamSL, Liga-ID 56045 · schulministerium.nrw | 23.08.2026 |
| 2026-10-26 | 44 | **nein** | 0 | Kein KLH-Spieltermin laut TeamSL; Mo–Sa liegen in den Herbstferien (bis Sa 31.10.), der So 01.11. ist Allerheiligen (gesetzlicher Feiertag in NRW). *Die Feiertags-Einordnung ist Interpretation; der tragende Beleg ist der leere Spielplan.* | TeamSL, Liga-ID 56045 · schulministerium.nrw | 23.08.2026 |
| 2026-11-02 | 45 | **JA** | 4 | Spieltag 3: So 08.11. (4 Spiele). | TeamSL, Liga-ID 56045 | 23.08.2026 |
| 2026-11-09 | 46 | **JA** | 4 | Spieltag 4: So 15.11. (4 Spiele). | TeamSL, Liga-ID 56045 | 23.08.2026 |
| 2026-11-16 | 47 | **nein** | 0 | Kein KLH-Spieltermin in dieser Woche laut TeamSL (Abruf 23.08.2026). *Interpretation:* Der So 22.11.2026 ist Totensonntag (stiller Feiertag in NRW) — plausible Erklärung für die Lücke, aber nicht vom Verband begründet; der tragende Beleg ist der leere Spielplan. | TeamSL, Liga-ID 56045 | 23.08.2026 |
| 2026-11-23 | 48 | **JA** | 4 | Spieltag 5: So 29.11. (4 Spiele). | TeamSL, Liga-ID 56045 | 23.08.2026 |
| 2026-11-30 | 49 | **JA** | 4 | Spieltag 6: So 06.12. (4 Spiele). | TeamSL, Liga-ID 56045 | 23.08.2026 |
| 2026-12-07 | 50 | **JA** | 4 | Spieltag 7: So 13.12. (4 Spiele). | TeamSL, Liga-ID 56045 | 23.08.2026 |
| 2026-12-14 | 51 | **JA** | 4 | Spieltag 8: So 20.12. (4 Spiele) — letzter Hinrunden-Spieltag vor der Weihnachtspause (Ferien ab Mi 23.12.). | TeamSL, Liga-ID 56045 · schulministerium.nrw | 23.08.2026 |

## Kurzfassung

- **8 Spielwochen** im Messfenster (Mo 28.09., 05.10., 02.11., 09.11., 23.11., 30.11.,
  07.12., 14.12.) — jede mit genau 4 KLH-Spielterminen, zusammen 32 der 72 Saisonspiele.
- **4 spielfreie Wochen** (Mo 12.10., 19.10., 26.10., 16.11.): drei rund um die
  NRW-Herbstferien, eine im November (Totensonntags-Wochenende — als Interpretation
  gekennzeichnet). In allen vier ist der tragende Beleg derselbe: **kein KLH-Spieltermin
  laut TeamSL, Abruf 23.08.2026.**
- Für die Kernmetrik der Wiederkehr-Definition (Strecke bis Stichtag So 29.11.2026,
  §1.4/§2.4) liegen davon **5 Spielwochen** im Wertungszeitraum (28.09., 05.10., 02.11.,
  09.11., 23.11. — die Woche ab 23.11. endet mit dem Stichtag 29.11.); die Wochen ab
  30.11. dienen Begleitmetriken und der Phase danach.

## Abgleich mit der Definitionsdatei

§2.4 erwartete „~7–9 Spielwochen" im Zeitraum bis 29.11. — tatsächlich sind es dort
**5** (die Herbstferien schlucken drei Wochen am Stück, dazu der Totensonntag). Das ist
kein Widerspruch zur Definition, aber eine Information für die Schwellen-Bewertung:
Ein Spieler, der in der Woche ab 28.09. registriert wird, hat bis zum Stichtag nur
**4 mögliche Spielwochen nach seiner Registrierungswoche** — exakt das Minimum aus
§1.4 („mindestens 4 mögliche Spielwochen"). Wer später kommt, fällt in „zu jung für
Wertung". **Das gehört vor Ronja/Patrick, bevor der Messjob gebaut wird** — ggf. ist
der Stichtag 30.11. mit diesem Kalender zu knapp gewählt.
