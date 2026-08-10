"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FaUser, FaUsers, FaTrophy } from "react-icons/fa";
import { getPlayerToken } from "@/lib/clientAuth";
import Reveal from "@/components/ui/Reveal";

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
        icon: FaUser,
        href: "/player/edit-profile",
        title: "Profil vervollständigen",
        text: "Ergänze Stats, Position und ein Foto – so finden dich Vereine und Scouts leichter.",
      },
      { icon: FaUsers, ...teamCard },
      {
        icon: FaTrophy,
        href: "/ligen",
        title: "Ligen & Topscorer verfolgen",
        text: "Behalte Tabellen, Spielpläne und die Topscorer-Liste deiner Region im Blick.",
      },
    ];

    return (
      <section className="bg-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">
            Deine nächsten Schritte
          </h2>
          <p className="text-gray-500 mb-16">Hol mehr aus Hoops Germany raus</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {cards.map((c, i) => {
              const Icon = c.icon;
              return (
                <Reveal key={c.title} delay={i * 90} className="h-full">
                  <Link
                    href={c.href}
                    className="group block h-full text-center bg-gray-50 hover:bg-brand-50 border border-gray-100 hover:border-brand-200 rounded-xl p-8 transition-[transform,background-color,border-color] duration-200 ease-out-strong hover:-translate-y-1 motion-reduce:hover:translate-y-0"
                  >
                    <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="text-brand-500 text-2xl" />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-brand-600">
                      {c.title}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{c.text}</p>
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
    <section className="bg-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-black mb-4 text-gray-900">So funktionierts</h2>
        <p className="text-gray-500 mb-16">In 3 einfachen Schritten dabei</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90} className="text-center">
              <div
                className={`w-16 h-16 ${
                  s.dark ? "bg-gradient-to-r from-slate-950 to-slate-800" : "bg-brand-500"
                } text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-black`}
              >
                {s.n}
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">{s.title}</h3>
              <p className="text-gray-500 text-sm">{s.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
