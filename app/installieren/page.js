"use client";

import { useEffect, useState } from "react";
import {
  PiDeviceMobileBold,
  PiAppleLogoBold,
  PiAndroidLogoBold,
  PiDesktopBold,
  PiShareNetworkBold,
  PiPlusSquareBold,
  PiDotsThreeVerticalBold,
  PiCheckCircleBold,
  PiLightningBold,
  PiArrowsClockwiseBold,
  PiWifiHighBold,
  PiCaretDownBold,
  PiDownloadSimpleBold,
} from "react-icons/pi";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageHeader from "@/components/layout/PageHeader";

function Step({ n, children }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-navy-950">
        {n}
      </span>
      <span className="pt-0.5 text-mist-300">{children}</span>
    </li>
  );
}

// Aufklappbarer Plattform-Abschnitt.
function Section({ icon: Icon, title, badge, open, onToggle, children }) {
  return (
    <div className="bg-navy-800 rounded-md border border-navy-600 overflow-hidden">
      <button
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-navy-700 transition-colors"
      >
        <Icon className="text-paper-50 text-lg flex-shrink-0" />
        <span className="font-bold text-paper-50 flex-1">{title}</span>
        {badge && (
          <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-400 bg-brand-500/10 rounded-sm px-2 py-0.5">
            {badge}
          </span>
        )}
        <PiCaretDownBold
          className={`text-mist-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
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
    <div className="min-h-screen bg-navy-950 flex flex-col">
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
            { icon: PiDeviceMobileBold, t: "Vollbild" },
            { icon: PiArrowsClockwiseBold, t: "Immer aktuell" },
            { icon: PiLightningBold, t: "Schneller Start" },
          ].map((b) => (
            <div key={b.t} className="bg-navy-800 rounded-md border border-navy-600 p-4 text-center">
              <b.icon className="mx-auto text-brand-400 text-xl" />
              <p className="mt-2 text-xs font-medium text-mist-300">{b.t}</p>
            </div>
          ))}
        </div>

        {installed ? (
          <div className="bg-navy-800 rounded-md border border-signal-ok/50 p-6 flex items-center gap-3">
            <PiCheckCircleBold className="text-signal-ok text-2xl flex-shrink-0" />
            <div>
              <p className="font-semibold text-paper-50">Schon installiert 🎉</p>
              <p className="text-sm text-mist-400">
                Du nutzt Hoops Germany bereits als App. Viel Spaß!
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Direkter Install-Button, wenn der Browser ihn anbietet (Chrome/Edge/Opera, Android+Desktop) */}
            {deferred && (
              <div className="bg-navy-800 rounded-md border border-brand-500/50 p-6 text-center">
                <p className="text-sm text-mist-400 mb-3">
                  Dein Browser unterstützt die direkte Installation – ein Klick genügt:
                </p>
                <button
                  onClick={install}
                  className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-400 text-navy-950 rounded-sm px-6 py-3 font-semibold"
                >
                  <PiDownloadSimpleBold /> App installieren
                </button>
              </div>
            )}

            <p className="text-sm text-mist-400">
              Oder wähle dein Gerät{" "}
              <span className="text-mist-400">
                (wir haben <strong>{detectedLabel}</strong> erkannt und passend geöffnet):
              </span>
            </p>

            {/* iPhone / iPad */}
            <Section
              icon={PiAppleLogoBold}
              title="iPhone / iPad (Safari)"
              badge={detected === "ios" ? "Dein Gerät" : null}
              open={open === "ios"}
              onToggle={() => toggle("ios")}
            >
              <ol className="space-y-3 text-sm">
                <Step n="1">
                  Öffne diese Seite in <strong>Safari</strong> und tippe unten (bzw. oben) auf das{" "}
                  <strong>Teilen-Symbol</strong>{" "}
                  <PiShareNetworkBold className="inline -mt-0.5 text-brand-400" />.
                </Step>
                <Step n="2">
                  Wähle <strong>„Zum Home-Bildschirm“</strong>{" "}
                  <PiPlusSquareBold className="inline -mt-0.5 text-brand-400" />.
                </Step>
                <Step n="3">
                  Tippe auf <strong>„Hinzufügen“</strong> – das Hoops-Germany-Icon erscheint auf dem
                  Home-Bildschirm.
                </Step>
              </ol>
            </Section>

            {/* Android */}
            <Section
              icon={PiAndroidLogoBold}
              title="Android (Chrome)"
              badge={detected === "android" ? "Dein Gerät" : null}
              open={open === "android"}
              onToggle={() => toggle("android")}
            >
              <ol className="space-y-3 text-sm">
                <Step n="1">
                  Tippe oben rechts auf das <strong>Menü</strong>{" "}
                  <PiDotsThreeVerticalBold className="inline -mt-0.5 text-brand-400" />.
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
              icon={PiDesktopBold}
              title="Desktop (Chrome, Edge, Opera)"
              badge={detected === "desktop" ? "Dein Gerät" : null}
              open={open === "desktop"}
              onToggle={() => toggle("desktop")}
            >
              <ol className="space-y-3 text-sm">
                <Step n="1">
                  Klicke rechts in der <strong>Adressleiste</strong> auf das{" "}
                  <strong>Installations-Symbol</strong> (Monitor mit Pfeil bzw.{" "}
                  <PiPlusSquareBold className="inline -mt-0.5 text-brand-400" />
                  ).
                </Step>
                <Step n="2">
                  Kein Symbol sichtbar? Öffne das <strong>Browser-Menü</strong> und wähle{" "}
                  <strong>„App installieren“</strong> / <strong>„Installieren“</strong> (bei Opera ggf.
                  unter <em>„… in Sidebar/Apps“</em>).
                </Step>
                <Step n="3">Bestätigen – Hoops Germany öffnet sich künftig als eigenes Fenster.</Step>
              </ol>
              <p className="mt-3 text-xs text-mist-400">
                Mac-Safari: Menü <strong>„Ablage“ → „Zum Dock hinzufügen“</strong>. Firefox unterstützt
                die Installation aktuell nicht – dort die Seite einfach als Lesezeichen speichern.
              </p>
            </Section>
          </>
        )}

        <p className="flex items-center justify-center gap-2 text-xs text-mist-400 pt-2">
          <PiWifiHighBold /> Die App ist die Website selbst – sie ist immer automatisch synchron, ohne Update
          aus einem Store.
        </p>
      </main>

      <Footer />
    </div>
  );
}
