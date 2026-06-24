// Zentrale, design-konforme E-Mail-Vorlagen (Navy-Header + Orange-Akzent + Inter,
// passend zum Seiten-Look). Alle Builder geben { subject, html, text } zurück.

const BRAND = "#f97316";

// Basis-Layout: Navy-Header mit echtem Logo, weiße Card, optionaler CTA-Button, Footer.
// `baseUrl` wird für das gehostete Logo (PNG, da SVG in Mail-Clients unzuverlässig) gebraucht;
// ohne baseUrl gibt es einen Text-Fallback.
export function emailLayout({ heading, intro, bodyHtml = "", ctaText, ctaUrl, footerNote, baseUrl }) {
  const logo = baseUrl
    ? `<img src="${baseUrl}/images/logo-email.png" alt="Hoops Germany" height="30" style="height:30px;width:auto;display:block;border:0">`
    : `<span style="color:#ffffff;font-weight:800;font-size:18px;letter-spacing:.3px">Hoops Germany</span>`;
  return `
  <div style="background:#f3f4f6;padding:24px 12px;font-family:Inter,Arial,Helvetica,sans-serif">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #eef0f3">
      <div style="background:linear-gradient(90deg,#020617,#1e293b);padding:20px 28px">
        ${logo}
      </div>
      <div style="padding:28px">
        <h1 style="margin:0 0 10px;color:#111827;font-size:22px;font-weight:800;line-height:1.3">${heading}</h1>
        ${intro ? `<p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6">${intro}</p>` : ""}
        ${bodyHtml}
        ${
          ctaText && ctaUrl
            ? `<p style="margin:24px 0 4px">
                 <a href="${ctaUrl}" style="background:${BRAND};color:#ffffff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block">${ctaText}</a>
               </p>`
            : ""
        }
      </div>
      <div style="padding:16px 28px;border-top:1px solid #f0f1f3;color:#9ca3af;font-size:12px;line-height:1.5">
        ${footerNote || "Du erhältst diese E-Mail, weil du ein Konto bei Hoops Germany hast."}
      </div>
    </div>
  </div>`;
}

// Eine anklickbare „Karte" mit Titel + Beschreibung (für Anreiz-Listen).
function linkCard(url, title, desc) {
  return `
    <a href="${url}" style="display:block;text-decoration:none;border:1px solid #eef0f3;border-radius:12px;padding:14px 16px;margin:10px 0">
      <span style="display:block;color:#111827;font-weight:600;font-size:15px">${title}</span>
      <span style="display:block;color:#6b7280;font-size:13px;margin-top:2px">${desc}</span>
    </a>`;
}

// Willkommensmail nach der Registrierung – freundlich, mit konkreten Anreizen.
export function welcomeEmail({ firstName, baseUrl }) {
  const name = firstName ? ` ${firstName}` : "";
  const bodyHtml = `
    <p style="margin:0 0 4px;color:#374151;font-size:15px;font-weight:600">Leg gleich los:</p>
    ${linkCard(
      `${baseUrl}/player/edit-profile`,
      "Profil ausfüllen",
      "Position, Größe, Verein und ein Bild – damit dich Teams finden."
    )}
    ${linkCard(
      `${baseUrl}/teams`,
      "Team finden & beitreten",
      "Stöbere durch Vereine in deiner Region und stell eine Beitrittsanfrage."
    )}
    ${linkCard(
      `${baseUrl}/tryouts`,
      "Tryouts entdecken",
      "Probetrainings in deiner Nähe – bewirb dich mit einem Klick."
    )}
    ${linkCard(
      `${baseUrl}/spieler`,
      "Spieler folgen",
      "Vernetze dich mit der Community und verfolge ihre Spiele & Transfers."
    )}`;

  return {
    subject: "Willkommen bei Hoops Germany 🏀",
    html: emailLayout({
      baseUrl,
      heading: `Willkommen${name}!`,
      intro:
        "Schön, dass du dabei bist. Hoops Germany ist die Community für Amateur-Basketball in Deutschland – finde Teams, tracke deine Spiele und werde Teil der Szene.",
      bodyHtml,
      ctaText: "Profil jetzt einrichten",
      ctaUrl: `${baseUrl}/player/edit-profile`,
      footerNote:
        "Du erhältst diese E-Mail, weil du dich gerade bei Hoops Germany registriert hast.",
    }),
    text:
      `Willkommen${name} bei Hoops Germany!\n\n` +
      `Leg gleich los:\n` +
      `- Profil ausfüllen: ${baseUrl}/player/edit-profile\n` +
      `- Team finden: ${baseUrl}/teams\n` +
      `- Tryouts entdecken: ${baseUrl}/tryouts\n` +
      `- Spieler folgen: ${baseUrl}/spieler\n`,
  };
}

// Erinnerung an den Team-Admin, ein fehlendes Ergebnis einzutragen.
export function pendingResultEmail({ teamName, opponentName, matchDate, baseUrl }) {
  const dateStr = matchDate
    ? new Date(matchDate).toLocaleDateString("de-DE")
    : "";
  const vs = opponentName ? ` gegen ${opponentName}` : "";
  return {
    subject: "Hoops Germany – Ergebnis eintragen",
    html: emailLayout({
      baseUrl,
      heading: "Ergebnis ausstehend",
      intro: `Für euer Spiel${vs}${dateStr ? ` vom ${dateStr}` : ""} fehlt noch das Ergebnis. Trag es kurz im Team-Bereich unter „Ergebnisse" ein – danach zählt es für Tabelle, Topscorer und Spielerprofile.`,
      ctaText: "Ergebnis eintragen",
      ctaUrl: `${baseUrl}/team/admin`,
      footerNote:
        "Du bekommst diese Erinnerung als Team-Admin. Du kannst sie in deinen Profil-Einstellungen abschalten – die Benachrichtigung in der Glocke bleibt davon unberührt.",
    }),
    text:
      `Ergebnis ausstehend für ${teamName}${vs}${dateStr ? ` (${dateStr})` : ""}.\n` +
      `Bitte eintragen: ${baseUrl}/team/admin\n`,
  };
}

// Alarm bei widersprüchlich gemeldeten Ergebnissen.
// forSuperAdmin=true → CTA ins Admin-Panel (auflösen); sonst in den Team-Bereich (korrigieren).
export function resultMismatchEmail({
  teamAName,
  teamBName,
  reportA,
  reportB,
  baseUrl,
  forSuperAdmin = false,
}) {
  const bodyHtml = `
    <div style="border:1px solid #fee2e2;background:#fef2f2;border-radius:12px;padding:14px 16px;margin:6px 0">
      <p style="margin:0;color:#991b1b;font-size:14px"><strong>${teamAName}</strong> meldet ${reportA}</p>
      <p style="margin:6px 0 0;color:#991b1b;font-size:14px"><strong>${teamBName}</strong> meldet ${reportB}</p>
    </div>`;
  return {
    subject: `Hoops Germany – Strittiges Ergebnis: ${teamAName} vs ${teamBName}`,
    html: emailLayout({
      baseUrl,
      heading: "Widersprüchliches Ergebnis",
      intro: `Für das Spiel ${teamAName} vs ${teamBName} wurden unterschiedliche Endstände gemeldet. ${
        forSuperAdmin
          ? "Bitte prüfe die Angaben und lege im Admin-Panel das richtige Ergebnis fest."
          : "Bitte stimmt euch mit dem gegnerischen Team ab und reicht das korrekte Ergebnis erneut ein."
      }`,
      bodyHtml,
      ctaText: forSuperAdmin ? "Im Admin-Panel auflösen" : "Ergebnis korrigieren",
      ctaUrl: forSuperAdmin ? `${baseUrl}/admin/matches` : `${baseUrl}/team/admin`,
      footerNote: forSuperAdmin
        ? "Du erhältst diese E-Mail als Super-Admin von Hoops Germany."
        : "Du erhältst diese E-Mail als Team-Admin, weil für euer Spiel widersprüchliche Ergebnisse vorliegen.",
    }),
    text:
      `Strittiges Ergebnis: ${teamAName} vs ${teamBName}.\n` +
      `${teamAName} meldet ${reportA}, ${teamBName} meldet ${reportB}.\n` +
      (forSuperAdmin
        ? `Auflösen: ${baseUrl}/admin/matches\n`
        : `Korrigieren: ${baseUrl}/team/admin\n`),
  };
}
