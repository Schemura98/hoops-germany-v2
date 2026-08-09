"use client";

import { useEffect, useState } from "react";
import {
  FaMobileAlt,
  FaApple,
  FaAndroid,
  FaDesktop,
  FaShareSquare,
  FaPlusSquare,
  FaEllipsisV,
  FaCheckCircle,
  FaBolt,
  FaSyncAlt,
  FaWifi,
  FaChevronDown,
  FaDownload,
} from "react-icons/fa";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";

function Step({ n, children }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
        {n}
      </span>
      <span className="pt-0.5 text-gray-700">{children}</span>
    </li>
  );
}

// Aufklappbarer Plattform-Abschnitt.
function Section({ icon: Icon, title, badge, open, onToggle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <Icon className="text-gray-800 text-lg flex-shrink-0" />
        <span className="font-bold text-gray-900 flex-1">{title}</span>
        {badge && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-600 bg-brand-50 rounded-full px-2 py-0.5">
            {badge}
          </span>
        )}
        <FaChevronDown
          className={`text-gray-500 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-6 pb-6 -mt-1">{children}</div>}
    </div>
  );
}

export default function InstallierenPage() {
  // "ios" | "android" | "desktop" – erkannter Abschnitt, der zuerst geöffnet wird.
  const [detected, setDetected] = useState("desktop");
  const [open, setOpen] = useState("desktop");
  const [installed, setInstalled] = useState(false);
  const [deferred, setDeferred] = useState(null);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isIOS =
      /iphone|ipad|ipod/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /android/i.test(ua);
    const section = isIOS ? "ios" : isAndroid ? "android" : "desktop";
    setDetected(section);
    setOpen(section);

    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setInstalled(!!standalone);

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function install() {
    if (!deferred) return;
    deferred.prompt();
    try {
      await deferred.userChoice;
    } catch {
      /* egal */
    }
    setDeferred(null);
  }

  const toggle = (key) => setOpen((cur) => (cur === key ? null : key));
  const detectedLabel = { ios: "iPhone / iPad", android: "Android", desktop: "Desktop" }[detected];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <PageHeader
        eyebrow="Hoops Germany"
        title="Als App installieren"
        subtitle="Installiere Hoops Germany wie eine echte App – im Vollbild, mit eigenem Icon. Auf Handy, Tablet und Desktop."
      />

      <main className="flex-1 w-full max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Vorteile */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: FaMobileAlt, t: "Vollbild" },
            { icon: FaSyncAlt, t: "Immer aktuell" },
            { icon: FaBolt, t: "Schneller Start" },
          ].map((b) => (
            <div key={b.t} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
              <b.icon className="mx-auto text-brand-500 text-xl" />
              <p className="mt-2 text-xs font-medium text-gray-700">{b.t}</p>
            </div>
          ))}
        </div>

        {installed ? (
          <div className="bg-white rounded-2xl border border-green-200 p-6 flex items-center gap-3">
            <FaCheckCircle className="text-green-500 text-2xl flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Schon installiert 🎉</p>
              <p className="text-sm text-gray-600">
                Du nutzt Hoops Germany bereits als App. Viel Spaß!
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Direkter Install-Button, wenn der Browser ihn anbietet (Chrome/Edge/Opera, Android+Desktop) */}
            {deferred && (
              <div className="bg-white rounded-2xl border border-brand-200 p-6 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Dein Browser unterstützt die direkte Installation – ein Klick genügt:
                </p>
                <button
                  onClick={install}
                  className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-6 py-3 font-semibold"
                >
                  <FaDownload /> App installieren
                </button>
              </div>
            )}

            <p className="text-sm text-gray-500">
              Oder wähle dein Gerät{" "}
              <span className="text-gray-500">
                (wir haben <strong>{detectedLabel}</strong> erkannt und passend geöffnet):
              </span>
            </p>

            {/* iPhone / iPad */}
            <Section
              icon={FaApple}
              title="iPhone / iPad (Safari)"
              badge={detected === "ios" ? "Dein Gerät" : null}
              open={open === "ios"}
              onToggle={() => toggle("ios")}
            >
              <ol className="space-y-3 text-sm">
                <Step n="1">
                  Öffne diese Seite in <strong>Safari</strong> und tippe unten (bzw. oben) auf das{" "}
                  <strong>Teilen-Symbol</strong>{" "}
                  <FaShareSquare className="inline -mt-0.5 text-brand-500" />.
                </Step>
                <Step n="2">
                  Wähle <strong>„Zum Home-Bildschirm“</strong>{" "}
                  <FaPlusSquare className="inline -mt-0.5 text-brand-500" />.
                </Step>
                <Step n="3">
                  Tippe auf <strong>„Hinzufügen“</strong> – das Hoops-Germany-Icon erscheint auf dem
                  Home-Bildschirm.
                </Step>
              </ol>
            </Section>

            {/* Android */}
            <Section
              icon={FaAndroid}
              title="Android (Chrome)"
              badge={detected === "android" ? "Dein Gerät" : null}
              open={open === "android"}
              onToggle={() => toggle("android")}
            >
              <ol className="space-y-3 text-sm">
                <Step n="1">
                  Tippe oben rechts auf das <strong>Menü</strong>{" "}
                  <FaEllipsisV className="inline -mt-0.5 text-brand-500" />.
                </Step>
                <Step n="2">
                  Wähle <strong>„App installieren“</strong> bzw.{" "}
                  <strong>„Zum Startbildschirm hinzufügen“</strong>.
                </Step>
                <Step n="3">Bestätigen – das Icon landet auf dem Startbildschirm.</Step>
              </ol>
            </Section>

            {/* Desktop */}
            <Section
              icon={FaDesktop}
              title="Desktop (Chrome, Edge, Opera)"
              badge={detected === "desktop" ? "Dein Gerät" : null}
              open={open === "desktop"}
              onToggle={() => toggle("desktop")}
            >
              <ol className="space-y-3 text-sm">
                <Step n="1">
                  Klicke rechts in der <strong>Adressleiste</strong> auf das{" "}
                  <strong>Installations-Symbol</strong> (Monitor mit Pfeil bzw.{" "}
                  <FaPlusSquare className="inline -mt-0.5 text-brand-500" />
                  ).
                </Step>
                <Step n="2">
                  Kein Symbol sichtbar? Öffne das <strong>Browser-Menü</strong> und wähle{" "}
                  <strong>„App installieren“</strong> / <strong>„Installieren“</strong> (bei Opera ggf.
                  unter <em>„… in Sidebar/Apps“</em>).
                </Step>
                <Step n="3">Bestätigen – Hoops Germany öffnet sich künftig als eigenes Fenster.</Step>
              </ol>
              <p className="mt-3 text-xs text-gray-500">
                Mac-Safari: Menü <strong>„Ablage“ → „Zum Dock hinzufügen“</strong>. Firefox unterstützt
                die Installation aktuell nicht – dort die Seite einfach als Lesezeichen speichern.
              </p>
            </Section>
          </>
        )}

        <p className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
          <FaWifi /> Die App ist die Website selbst – sie ist immer automatisch synchron, ohne Update
          aus einem Store.
        </p>
      </main>

      <Footer />
    </div>
  );
}
