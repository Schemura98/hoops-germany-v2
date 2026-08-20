"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Aussenlinie from "@/components/landing/Aussenlinie";
import axios from "axios";
import { PiUserBold, PiUsersBold, PiTrophyBold } from "react-icons/pi";
import { getPlayerToken } from "@/lib/clientAuth";
import Reveal from "@/components/ui/Reveal";
import { staffel } from "@/lib/ui";

// Ausgeloggt: klassische Onboarding-Schritte (Registrieren → Profil → Community).
const STEPS = [
  { n: 1, dark: true, title: "Kostenlos registrieren", text: "Erstelle deinen Account in unter 2 Minuten – komplett kostenlos." },
  { n: 2, dark: false, title: "Profil vervollständigen", text: "Füge deine Position, Stats und ein Profilbild hinzu." },
  { n: 3, dark: true, title: "Community beitreten", text: "Tritt deinem Verein bei, verfolge Ligen und vernetze dich mit anderen Spielern." },
];

// Zeigt ausgeloggten Besuchern die Onboarding-Schritte, eingeloggten Usern
// stattdessen personalisierte „nächste Schritte" (direkte Links in die App).
export default function LandingHowItWorks() {
  const [player, setPlayer] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = getPlayerToken();
    if (!token) {
      setChecked(true);
      return;
    }
    let active = true;
    axios
      .post("/api/player/getmyinfo", { token })
      .then(({ data }) => active && setPlayer(data.player || null))
      .catch(() => active && setPlayer(null))
      .finally(() => active && setChecked(true));
    return () => {
      active = false;
    };
  }, []);

  if (checked && player) {
    const teamCard = player.isTeamAdmin
      ? {
          href: "/team/admin",
          title: "Dein Team verwalten",
          text: "Pflege deinen Kader, trage Spiele & Ergebnisse ein und schreibe Tryouts aus.",
        }
      : player.team?.slug
      ? {
          href: `/team/team-detail/${player.team.slug}`,
          title: "Dein Team ansehen",
          text: "Schau dir Kader, Spielplan und Ergebnisse deiner Mannschaft an.",
        }
      : {
          href: "/teams",
          title: "Team gründen oder beitreten",
          text: "Finde dein Team oder gründe ein eigenes – inklusive Kaderverwaltung.",
        };

    const cards = [
      {
        icon: PiUserBold,
        href: "/player/edit-profile",
        title: "Profil vervollständigen",
        // Vorher: "…so finden dich Vereine und Scouts leichter." Das war die
        // Stelle mit der stärksten Vereins-Färbung im ganzen Produkt – und sie
        // behauptete, dass Vereine suchen. Der Anreiz, das Profil zu füllen,
        // bleibt; der Nutzen liegt jetzt beim Spieler selbst.
        text: "Ergänze Stats, Position und ein Foto – deine Werte, bestätigt statt behauptet.",
      },
      { icon: PiUsersBold, ...teamCard },
      {
        icon: PiTrophyBold,
        href: "/ligen",
        title: "Ligen & Topscorer verfolgen",
        text: "Behalte Tabellen, Spielpläne und die Topscorer-Liste deiner Region im Blick.",
      },
    ];

    return (
      <section className="relative bg-navy-950 py-20 px-4">
      <Aussenlinie />
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-display uppercase tracking-tight text-3xl md:text-4xl font-black mb-4 text-paper-50">
            Deine nächsten Schritte
          </h2>
          <p className="text-mist-400 mb-16">Hol mehr aus Hoops Germany raus</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((c, i) => {
              const Icon = c.icon;
              // Mittlere Karte auf Navy – dieselbe Dunkel/Orange-Alternation,
              // die die ausgeloggte Variante schon vorlebt (Entscheid Vivien).
              const navy = i === 1;
              return (
                <Reveal key={c.title} delay={staffel(i)} className="h-full">
                  <Link
                    href={c.href}
                    className="group block h-full text-center bg-navy-950 hover:bg-brand-500/10 border border-navy-600 hover:border-brand-500/50 rounded-md p-8 transition-[transform,background-color,border-color] duration-200 ease-out-strong hover:-translate-y-1 motion-reduce:hover:translate-y-0"
                  >
                    <div
                      className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
                        navy ? "bg-navy-900" : "bg-brand-500/15"
                      }`}
                    >
                      <Icon className={`text-2xl ${navy ? "text-paper-50" : "text-brand-400"}`} />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-paper-50 group-hover:text-brand-400">
                      {c.title}
                    </h3>
                    <p className="text-mist-400 text-sm leading-relaxed">{c.text}</p>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-navy-950 py-20 px-4">
      <Aussenlinie />
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="font-display uppercase tracking-tight text-3xl md:text-4xl font-black mb-4 text-paper-50">So funktionierts</h2>
        <p className="text-mist-400 mb-16">In 3 einfachen Schritten dabei</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={staffel(i)} className="text-center">
              <div
                // Textfarbe haengt an der Flaeche: Auf der orangen Ziffer waere
                // paper-50 bei 2,61:1 - dort steht navy-950 (7,1:1).
                className={`w-16 h-16 font-display ${
                  s.dark ? "bg-navy-900 text-paper-50 border border-navy-600" : "bg-brand-500 text-navy-950"
                } rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-black`}
              >
                {s.n}
              </div>
              <h3 className="font-bold text-lg mb-2 text-paper-50">{s.title}</h3>
              <p className="text-mist-400 text-sm">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
