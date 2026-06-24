// Einheitliches E-Mail-Design-System für Hoops Germany.
// Tabellenbasiert (Outlook/Gmail-kompatibel), mobile-first, alle Styles inline.
// Logo bleibt unverändert (gehostete PNG, da SVG in Mail-Clients unzuverlässig);
// es wird zentriert im dunklen Header dargestellt.
// Alle Builder geben { subject, html, text } zurück.

const BRAND = "#f97316"; // Orange = Haupt-/CTA-Farbe (beibehalten)

// Status-Akzente je Mail-Typ (Badge + dünne Akzentleiste oben).
const ACCENTS = {
  green: { solid: "#10b981", bg: "#ecfdf5", text: "#047857" },
  orange: { solid: "#f97316", bg: "#fff7ed", text: "#c2410c" },
  blue: { solid: "#3b82f6", bg: "#eff6ff", text: "#1d4ed8" },
  red: { solid: "#ef4444", bg: "#fef2f2", text: "#b91c1c" },
  amber: { solid: "#f59e0b", bg: "#fffbeb", text: "#b45309" },
  purple: { solid: "#8b5cf6", bg: "#f5f3ff", text: "#6d28d9" },
  slate: { solid: "#64748b", bg: "#f1f5f9", text: "#334155" },
};

// Kleines farbiges Status-Label (Pill).
function pill(text, ac) {
  return `<span style="display:inline-block;background:${ac.bg};color:${ac.text};font-size:12px;font-weight:700;line-height:1;padding:7px 13px;border-radius:999px;letter-spacing:.3px">${text}</span>`;
}

// Neutrale Kontext-Badge (z. B. „Team", „Spiel", „Kader").
export function contextBadge(text) {
  return `<span style="display:inline-block;background:#f1f5f9;color:#334155;font-size:12px;font-weight:600;line-height:1;padding:6px 11px;border-radius:8px">${text}</span>`;
}

// Anklickbare Karte mit Titel + Beschreibung (Anreiz-Listen).
export function linkCard(url, title, desc) {
  return `
    <a href="${url}" style="display:block;text-decoration:none;border:1px solid #e8ebf0;border-radius:12px;padding:16px 18px;margin:12px 0">
      <span style="display:block;color:#0f172a;font-weight:700;font-size:15px">${title}</span>
      <span style="display:block;color:#64748b;font-size:13px;line-height:1.5;margin-top:3px">${desc}</span>
    </a>`;
}

// Bulletproof-naher, zentrierter CTA-Button (immer Orange).
function ctaButton(text, url) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:8px auto 0">
      <tr>
        <td align="center" bgcolor="${BRAND}" style="border-radius:10px">
          <a href="${url}" style="display:inline-block;background:${BRAND};color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:15px 34px;border-radius:10px">${text}</a>
        </td>
      </tr>
    </table>`;
}

// Basis-Layout. accent steuert Badge + Akzentleiste; CTA bleibt Orange.
export function emailLayout({
  baseUrl,
  accent = "orange",
  badge,
  title,
  intro,
  bodyHtml = "",
  ctaText,
  ctaUrl,
  footerNote,
}) {
  const ac = ACCENTS[accent] || ACCENTS.orange;
  const logo = baseUrl
    ? `<img src="${baseUrl}/images/logo-email.png" alt="Hoops Germany" width="190" style="width:190px;max-width:80%;height:auto;display:block;margin:0 auto;border:0">`
    : `<span style="color:#ffffff;font-weight:800;font-size:18px">Hoops Germany</span>`;

  return `
  <div style="background:#eef1f5;margin:0;padding:28px 12px;font-family:'Segoe UI',Inter,Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef1f5">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:16px;border:1px solid #e6e9ef;overflow:hidden">
          <!-- Akzentleiste -->
          <tr><td style="height:4px;background:${ac.solid};line-height:4px;font-size:0">&nbsp;</td></tr>
          <!-- Header: zentriertes Logo, luftig -->
          <tr><td align="center" style="background:#0b1220;padding:34px 24px">${logo}</td></tr>
          <!-- Body -->
          <tr><td style="padding:34px 36px 10px;text-align:center">
            ${badge ? `<div style="margin-bottom:14px">${pill(badge, ac)}</div>` : ""}
            ${title ? `<h1 style="margin:0 0 12px;color:#0f172a;font-size:23px;line-height:1.3;font-weight:800;text-align:center">${title}</h1>` : ""}
            ${intro ? `<p style="margin:0 0 18px;color:#475569;font-size:15px;line-height:1.65;text-align:center">${intro}</p>` : ""}
            ${bodyHtml ? `<div style="text-align:left;margin-top:4px">${bodyHtml}</div>` : ""}
          </td></tr>
          ${
            ctaText && ctaUrl
              ? `<tr><td align="center" style="padding:6px 36px 34px">${ctaButton(ctaText, ctaUrl)}</td></tr>`
              : `<tr><td style="height:14px"></td></tr>`
          }
          <!-- Footer -->
          <tr><td style="padding:20px 36px;border-top:1px solid #eef1f5;background:#fafbfc">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6">${
              footerNote ||
              "Du erhältst diese E-Mail, weil du ein Konto bei Hoops Germany hast."
            }</p>
          </td></tr>
        </table>
        <p style="margin:18px 0 0;color:#aab2bf;font-size:11px">🏀 Hoops Germany · Community für Amateur-Basketball</p>
      </td></tr>
    </table>
  </div>`;
}

// ---------------------------------------------------------------------------
// 01 – Willkommensmail
// ---------------------------------------------------------------------------
export function welcomeEmail({ firstName, baseUrl }) {
  const name = firstName ? ` ${firstName}` : "";
  const bodyHtml = `
    <p style="margin:0 0 4px;color:#0f172a;font-size:15px;font-weight:700">Leg gleich los:</p>
    ${linkCard(`${baseUrl}/player/edit-profile`, "Profil ausfüllen", "Position, Größe, Verein und ein Bild – damit Teams dich finden.")}
    ${linkCard(`${baseUrl}/teams`, "Team & Kader verwalten", "Tritt einem Verein bei oder gründe dein eigenes Team.")}
    ${linkCard(`${baseUrl}/tryouts`, "Tryouts entdecken", "Probetrainings in deiner Nähe – bewirb dich mit einem Klick.")}
    ${linkCard(`${baseUrl}/spieler`, "Spieler folgen", "Vernetze dich und verfolge Spiele, Ergebnisse & Transfers.")}`;

  return {
    subject: "Willkommen bei Hoops Germany 🏀",
    html: emailLayout({
      baseUrl,
      accent: "green",
      badge: "🏀 Willkommen",
      title: `Willkommen${name}!`,
      intro:
        "Schön, dass du dabei bist. Ab jetzt verwaltest du dein Team, deinen Kader und deine Basketball-Aktivitäten zentral an einem Ort – und bist Teil der größten Community für Amateur-Basketball in Deutschland.",
      bodyHtml,
      ctaText: "Profil jetzt einrichten",
      ctaUrl: `${baseUrl}/player/edit-profile`,
      footerNote:
        "Du erhältst diese E-Mail, weil du dich gerade bei Hoops Germany registriert hast.",
    }),
    text:
      `Willkommen${name} bei Hoops Germany!\n\n` +
      `Ab jetzt verwaltest du Team, Kader und deine Basketball-Aktivitäten zentral.\n\n` +
      `Leg gleich los:\n` +
      `- Profil ausfüllen: ${baseUrl}/player/edit-profile\n` +
      `- Team & Kader: ${baseUrl}/teams\n` +
      `- Tryouts: ${baseUrl}/tryouts\n` +
      `- Spieler folgen: ${baseUrl}/spieler\n`,
  };
}

// ---------------------------------------------------------------------------
// 02 – Ergebnis-Erinnerung (Team-Admin)
// ---------------------------------------------------------------------------
export function pendingResultEmail({ teamName, opponentName, matchDate, baseUrl }) {
  const dateStr = matchDate ? new Date(matchDate).toLocaleDateString("de-DE") : "";
  const matchLabel = `${teamName}${opponentName ? ` vs ${opponentName}` : ""}`;
  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8ebf0;border-radius:12px;margin:4px 0 6px">
      <tr><td style="padding:16px 18px">
        <div style="margin-bottom:8px">${contextBadge("🏀 Spiel")}${dateStr ? ` <span style="color:#94a3b8;font-size:13px">· ${dateStr}</span>` : ""}</div>
        <span style="color:#0f172a;font-weight:700;font-size:16px">${matchLabel}</span>
        <p style="margin:6px 0 0;color:#64748b;font-size:13px">Endstand &amp; Spieler-Statistiken fehlen noch.</p>
      </td></tr>
    </table>`;
  return {
    subject: "Ergebnis eintragen – Hoops Germany",
    html: emailLayout({
      baseUrl,
      accent: "blue",
      badge: "Erinnerung",
      title: "Ein Ergebnis wartet auf dich",
      intro:
        "Für ein vergangenes Spiel deines Teams fehlt noch der Endstand. Sobald du ihn einträgst, zählt das Spiel für Tabelle, Topscorer und die Spielerprofile – das dauert nur einen Moment.",
      bodyHtml,
      ctaText: "Ergebnis eintragen",
      ctaUrl: `${baseUrl}/team/admin`,
      footerNote:
        "Du bekommst diese Erinnerung als Team-Admin. In deinen Profil-Einstellungen kannst du sie abschalten – die Benachrichtigung in der Glocke bleibt davon unberührt.",
    }),
    text:
      `Ergebnis ausstehend: ${matchLabel}${dateStr ? ` (${dateStr})` : ""}.\n` +
      `Jetzt eintragen: ${baseUrl}/team/admin\n`,
  };
}

// ---------------------------------------------------------------------------
// 03/04 – Strittiges Ergebnis (Mismatch)
// forSuperAdmin=true → auflösen; sonst korrigieren.
// ---------------------------------------------------------------------------
export function resultMismatchEmail({
  teamAName,
  teamBName,
  reportA,
  reportB,
  baseUrl,
  forSuperAdmin = false,
}) {
  const row = (team, report) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #fde2e2;color:#0f172a;font-size:14px;font-weight:600">${team}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #fde2e2;text-align:right;color:#b91c1c;font-size:15px;font-weight:800;white-space:nowrap">${report}</td>
    </tr>`;
  const bodyHtml = `
    <div style="margin-bottom:14px">${contextBadge("🏀 Spiel")} ${contextBadge("Ergebnis-Konflikt")}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fecaca;border-radius:12px;overflow:hidden;background:#fff5f5">
      <tr><td colspan="2" style="padding:12px 16px;color:#7f1d1d;font-size:13px;font-weight:700;background:#fef2f2">${teamAName} &nbsp;vs&nbsp; ${teamBName} <span style="font-weight:500;color:#b91c1c">(gemeldete Endstände, jeweils ${teamAName}:${teamBName})</span></td></tr>
      ${row(teamAName, reportA)}
      ${row(teamBName, reportB)}
    </table>`;
  return {
    subject: `Strittiges Ergebnis: ${teamAName} vs ${teamBName}`,
    html: emailLayout({
      baseUrl,
      accent: forSuperAdmin ? "red" : "amber",
      badge: forSuperAdmin ? "Konflikt – Aktion nötig" : "Ergebnis klären",
      title: "Die Ergebnisse stimmen nicht überein",
      intro: forSuperAdmin
        ? "Beide Teams haben für dieses Spiel unterschiedliche Endstände gemeldet. Bitte prüfe die Angaben und lege im Admin-Panel das korrekte Ergebnis fest."
        : "Für euer Spiel wurden zwei unterschiedliche Endstände gemeldet – das passiert schon mal. Stimmt euch kurz mit dem gegnerischen Team ab und reicht den richtigen Endstand erneut ein, dann ist alles geklärt.",
      bodyHtml,
      ctaText: forSuperAdmin ? "Konflikt prüfen" : "Ergebnis korrigieren",
      ctaUrl: forSuperAdmin ? `${baseUrl}/admin/matches` : `${baseUrl}/team/admin`,
      footerNote: forSuperAdmin
        ? "Du erhältst diese E-Mail als Super-Admin von Hoops Germany."
        : "Du erhältst diese E-Mail als Team-Admin, weil für euer Spiel widersprüchliche Ergebnisse vorliegen.",
    }),
    text:
      `Strittiges Ergebnis: ${teamAName} vs ${teamBName}.\n` +
      `${teamAName} meldet ${reportA}, ${teamBName} meldet ${reportB}.\n` +
      (forSuperAdmin
        ? `Konflikt prüfen: ${baseUrl}/admin/matches\n`
        : `Ergebnis korrigieren: ${baseUrl}/team/admin\n`),
  };
}

// ---------------------------------------------------------------------------
// 05 – Slot-Einladung in den Kader
// ---------------------------------------------------------------------------
export function inviteEmail({ teamName, position, link, baseUrl }) {
  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ffe8d6;border-radius:12px;background:#fff8f2;margin:4px 0 6px">
      <tr><td style="padding:18px">
        <div style="margin-bottom:10px">${contextBadge("🏀 Kader")}</div>
        <span style="display:block;color:#0f172a;font-size:18px;font-weight:800">${teamName}</span>
        ${
          position
            ? `<div style="margin-top:10px"><span style="display:inline-block;background:#ffedd5;color:#c2410c;font-size:13px;font-weight:700;padding:6px 12px;border-radius:8px">Position: ${position}</span></div>`
            : ""
        }
      </td></tr>
    </table>`;
  return {
    subject: `Einladung in den Kader von ${teamName}`,
    html: emailLayout({
      baseUrl,
      accent: "orange",
      badge: "Einladung",
      title: `${teamName} möchte dich im Kader`,
      intro:
        "Du wurdest eingeladen, einen Platz im Kader zu übernehmen. Nimm die Einladung an, leg in wenigen Sekunden dein Konto an – und du erscheinst direkt in der Mannschaft.",
      bodyHtml,
      ctaText: "Platz im Kader annehmen",
      ctaUrl: link,
      footerNote:
        "Falls dich diese Einladung nicht betrifft, kannst du diese E-Mail einfach ignorieren.",
    }),
    text:
      `Einladung in den Kader von ${teamName}${position ? ` (Position: ${position})` : ""}.\n` +
      `Platz annehmen: ${link}\n`,
  };
}

// ---------------------------------------------------------------------------
// 06 – Passwort zurücksetzen
// ---------------------------------------------------------------------------
export function passwordResetEmail({ firstName, link, baseUrl }) {
  const name = firstName ? ` ${firstName}` : "";
  const bodyHtml = `
    <p style="margin:0 0 16px;color:#475569;font-size:13px;line-height:1.6">
      Aus Sicherheitsgründen ist der Link <strong>1 Stunde</strong> gültig.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8ebf0;border-radius:12px;background:#f8fafc">
      <tr><td style="padding:14px 16px;color:#64748b;font-size:13px;line-height:1.6">
        🔒 Falls du diese Anfrage nicht gestellt hast, musst du nichts tun – ignoriere diese E-Mail einfach. Dein Passwort bleibt unverändert.
      </td></tr>
    </table>`;
  return {
    subject: "Passwort zurücksetzen – Hoops Germany",
    html: emailLayout({
      baseUrl,
      accent: "orange",
      badge: "Sicherheit",
      title: "Neues Passwort festlegen",
      intro: `Hallo${name}, du hast angefordert, dein Passwort zurückzusetzen. Klick auf den Button, um ein neues zu vergeben.`,
      bodyHtml,
      ctaText: "Neues Passwort setzen",
      ctaUrl: link,
      footerNote:
        "Diese E-Mail wurde automatisch versendet, weil für dein Konto ein Passwort-Reset angefragt wurde.",
    }),
    text:
      `Passwort zurücksetzen (Link 1 Stunde gültig): ${link}\n` +
      `Falls du das nicht warst, ignoriere diese E-Mail.\n`,
  };
}

// ---------------------------------------------------------------------------
// 07 – Feedback-Benachrichtigung (intern an Admin)
// ---------------------------------------------------------------------------
export function feedbackEmail({
  type,
  rating,
  areas = [],
  likes,
  dislikes,
  suggestions,
  freeMessage,
  baseUrl,
}) {
  const kv = (label, value) =>
    value
      ? `<tr>
          <td style="padding:10px 16px;border-bottom:1px solid #eef1f5;color:#64748b;font-size:13px;font-weight:600;width:120px;vertical-align:top">${label}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #eef1f5;color:#0f172a;font-size:14px;line-height:1.5">${value}</td>
        </tr>`
      : "";
  const stars = rating
    ? `<span style="color:#f59e0b;font-size:15px;letter-spacing:1px">${"★".repeat(rating)}${"☆".repeat(5 - rating)}</span> <span style="color:#0f172a;font-weight:700">${rating}/5</span>`
    : "";
  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8ebf0;border-radius:12px;overflow:hidden">
      ${kv("Typ", type)}
      ${kv("Bewertung", stars)}
      ${kv("Themen", areas.length ? areas.join(", ") : "")}
      ${kv("Positiv", likes ? likes.replace(/\n/g, "<br>") : "")}
      ${kv("Kritik", dislikes ? dislikes.replace(/\n/g, "<br>") : "")}
      ${kv("Vorschlag", suggestions ? suggestions.replace(/\n/g, "<br>") : "")}
      ${kv("Nachricht", freeMessage ? freeMessage.replace(/\n/g, "<br>") : "")}
    </table>`;
  return {
    subject: `Neues Feedback (${type}${rating ? ` · ${rating}/5` : ""})`,
    html: emailLayout({
      baseUrl,
      accent: "purple",
      badge: "Internes Feedback",
      title: "Neue Rückmeldung eingegangen",
      intro: "Ein Nutzer hat Feedback über das Formular hinterlassen:",
      bodyHtml,
      footerNote: "Interne Benachrichtigung · Hoops Germany Feedback",
    }),
    text:
      `Neues Feedback (${type}${rating ? ` · ${rating}/5` : ""})\n` +
      [areas.length ? `Themen: ${areas.join(", ")}` : "", likes && `Positiv: ${likes}`, dislikes && `Kritik: ${dislikes}`, suggestions && `Vorschlag: ${suggestions}`, freeMessage]
        .filter(Boolean)
        .join("\n"),
  };
}

// ---------------------------------------------------------------------------
// 08 – Kontaktanfrage (intern an Team)
// ---------------------------------------------------------------------------
export function contactEmail({ name, email, message, baseUrl }) {
  const bodyHtml = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8ebf0;border-radius:12px;overflow:hidden">
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #eef1f5;color:#64748b;font-size:13px;font-weight:600;width:90px">Von</td>
        <td style="padding:10px 16px;border-bottom:1px solid #eef1f5;color:#0f172a;font-size:14px;font-weight:600">${name}</td>
      </tr>
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #eef1f5;color:#64748b;font-size:13px;font-weight:600">E-Mail</td>
        <td style="padding:10px 16px;border-bottom:1px solid #eef1f5;color:#1d4ed8;font-size:14px"><a href="mailto:${email}" style="color:#1d4ed8;text-decoration:none">${email}</a></td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#64748b;font-size:13px;font-weight:600;vertical-align:top">Nachricht</td>
        <td style="padding:12px 16px;color:#0f172a;font-size:14px;line-height:1.6">${message.replace(/\n/g, "<br>")}</td>
      </tr>
    </table>`;
  return {
    subject: `Kontaktanfrage von ${name}`,
    html: emailLayout({
      baseUrl,
      accent: "blue",
      badge: "Kontaktanfrage",
      title: "Neue Nachricht über das Kontaktformular",
      intro: "Es ist eine Kontaktanfrage eingegangen. Du kannst direkt per Antwort reagieren:",
      bodyHtml,
      ctaText: "Antworten",
      ctaUrl: `mailto:${email}`,
      footerNote: "Interne Benachrichtigung · Hoops Germany Kontakt",
    }),
    text: `Kontaktanfrage von ${name} (${email}):\n\n${message}\n`,
  };
}
