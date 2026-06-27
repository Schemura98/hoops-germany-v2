"use client";

import { useEffect, useState } from "react";
import {
  FaMobileAlt,
  FaApple,
  FaAndroid,
  FaShareSquare,
  FaPlusSquare,
  FaEllipsisV,
  FaCheckCircle,
  FaBolt,
  FaSyncAlt,
  FaWifi,
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

export default function InstallierenPage() {
  const [platform, setPlatform] = useState("other"); // ios | android | other
  const [installed, setInstalled] = useState(false);
  const [deferred, setDeferred] = useState(null);

  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isIOS = /iphone|ipad|ipod/i.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const isAndroid = /android/i.test(ua);
    setPlatform(isIOS ? "ios" : isAndroid ? "android" : "other");

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
      /* still */
    }
    setDeferred(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <PageHeader
        eyebrow="Hoops Germany"
        title="Als App aufs Handy"
        subtitle="Installiere Hoops Germany wie eine echte App – im Vollbild, mit eigenem Icon."
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
            {/* Android: direkter Button, wenn möglich */}
            {platform !== "ios" && deferred && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
                <p className="text-sm text-gray-600 mb-3">
                  Ein Klick genügt – dein Gerät unterstützt die direkte Installation:
                </p>
                <button
                  onClick={install}
                  className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-6 py-3 font-semibold"
                >
                  <FaPlusSquare /> App installieren
                </button>
              </div>
            )}

            {/* iOS-Anleitung */}
            {platform === "ios" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                  <FaApple /> iPhone / iPad (Safari)
                </h2>
                <ol className="space-y-3 text-sm">
                  <Step n="1">
                    Tippe unten (bzw. oben) auf das <strong>Teilen-Symbol</strong>{" "}
                    <FaShareSquare className="inline -mt-0.5 text-brand-500" />.
                  </Step>
                  <Step n="2">
                    Wähle <strong>„Zum Home-Bildschirm“</strong>{" "}
                    <FaPlusSquare className="inline -mt-0.5 text-brand-500" />.
                  </Step>
                  <Step n="3">
                    Tippe auf <strong>„Hinzufügen“</strong> – fertig! Das Hoops-Germany-Icon
                    erscheint auf dem Home-Bildschirm.
                  </Step>
                </ol>
              </div>
            )}

            {/* Android-Anleitung (Fallback ohne Button) */}
            {platform !== "ios" && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                  <FaAndroid /> Android (Chrome)
                </h2>
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
              </div>
            )}
          </>
        )}

        <p className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <FaWifi /> Die App ist die Website selbst – sie ist immer automatisch synchron, ohne Update aus einem Store.
        </p>
      </main>

      <Footer />
    </div>
  );
}
