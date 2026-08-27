"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("beranda");

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Active section detection
      const sections = ["beranda", "statistik", "daftar-ormas", "alur-syarat", "kontak"];
      const scrollPos = window.scrollY + 180;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${isScrolled
          ? "bg-white/95 text-slate-900 backdrop-blur-md shadow-md border-b border-slate-200/80 h-16"
          : "bg-transparent text-white border-b border-transparent h-20"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <Image
            src="/assets/pic/meno_adapted.png"
            alt="Logo Kesbangpol Mimika"
            width={48}
            height={48}
            priority
            className="h-10 w-auto object-contain filter drop-shadow-xs"
          />
          <div>
            <h1 className={`text-sm font-bold leading-tight transition-colors ${isScrolled ? "text-slate-900" : "text-white drop-shadow-xs"}`}>
              Badan Kesatuan Bangsa dan Politik Kabupaten Mimika
            </h1>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7">
          {[
            { id: "beranda", label: "Beranda" },
            { id: "statistik", label: "Statistik" },
            { id: "daftar-ormas", label: "Daftar Ormas" },
            { id: "alur-syarat", label: "Alur & Syarat" },
            { id: "kontak", label: "Kontak" },
          ].map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`relative text-xs font-semibold tracking-wide transition-all py-1 ${activeSection === link.id
                  ? isScrolled
                    ? "text-blue-900 font-bold"
                    : "text-amber-300 font-bold drop-shadow-xs"
                  : isScrolled
                    ? "text-slate-600 hover:text-blue-900"
                    : "text-slate-200 hover:text-white"
                }`}
            >
              {link.label}
              {activeSection === link.id && (
                <span
                  className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${isScrolled ? "bg-blue-800" : "bg-amber-300"
                    }`}
                />
              )}
            </a>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#alur-syarat"
            className={`text-xs font-semibold px-3 py-2 rounded-lg transition-all ${isScrolled
                ? "text-slate-700 hover:text-blue-900 hover:bg-slate-100"
                : "text-white hover:bg-white/10 drop-shadow-xs"
              }`}
          >
            Cek Syarat
          </a>
          <Link
            href="/login"
            className={`inline-flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow hover:-translate-y-0.5 active:translate-y-0 ${isScrolled
                ? "bg-blue-900 hover:bg-blue-800"
                : "bg-blue-600 hover:bg-blue-500 shadow-blue-950/40"
              }`}
          >
            <svg className="w-3.5 h-3.5 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Portal Login
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled ? "text-slate-700 hover:bg-slate-100" : "text-white hover:bg-white/10"
            }`}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div
          className={`md:hidden border-b px-4 pt-3 pb-6 space-y-3 transition-colors ${isScrolled
              ? "bg-white text-slate-900 border-slate-200"
              : "bg-slate-950/95 text-white border-slate-800"
            }`}
        >
          {["beranda", "statistik", "daftar-ormas", "alur-syarat", "kontak"].map((id) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block text-sm font-medium capitalize py-1.5 transition-colors ${activeSection === id
                  ? isScrolled
                    ? "text-blue-900 font-bold"
                    : "text-amber-300 font-bold"
                  : isScrolled
                    ? "text-slate-600 hover:text-slate-900"
                    : "text-slate-300 hover:text-white"
                }`}
            >
              {id.replace("-", " ")}
            </a>
          ))}
          <div className="pt-2 flex flex-col gap-2 border-t border-slate-200/40">
            <Link
              href="/login"
              className="w-full text-center text-xs font-bold text-white bg-blue-900 hover:bg-blue-800 py-2.5 rounded-lg shadow-xs"
            >
              Portal Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
