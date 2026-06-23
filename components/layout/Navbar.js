"use client";

import Link from "next/link";
import { useState } from "react";
import { FaBars, FaTimes, FaBasketballBall } from "react-icons/fa";

const links = [
  { href: "/spieler", label: "Spieler" },
  { href: "/teams", label: "Teams" },
  { href: "/spiele", label: "Spiele" },
  { href: "/ligen", label: "Ligen" },
  { href: "/tryouts", label: "Tryouts" },
  { href: "/transfermarkt", label: "Transfermarkt" },
  { href: "/topscorer", label: "Topscorer" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
          <FaBasketballBall className="text-brand-500" />
          Hoops Germany
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-gray-600 hover:text-brand-600 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            Login
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-700 text-xl"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menü"
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 px-6 py-4 flex flex-col gap-3">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-gray-600 hover:text-brand-600"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="bg-brand-500 hover:bg-brand-600 text-white rounded-lg px-4 py-2 text-sm font-medium text-center"
            onClick={() => setOpen(false)}
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  );
}
