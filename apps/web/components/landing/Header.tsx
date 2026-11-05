"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { clearStoredUser, getRoleRoute, getStoredUser } from "@/lib/auth";
import type { User } from "@edunova/shared-types";

const links = [
  { href: "#inicio", label: "Inicio", active: true },
  { href: "#que-es", label: "¿Qué es EduNova?" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#areas", label: "Áreas de aprendizaje" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    return getStoredUser();
  });

  const handleLogout = () => {
    clearStoredUser();
    setUser(null);
  };

  return (
    <header className="sticky top-0 z-50 bg-white">
      <div className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/assets/logo.svg"
            alt=""
            width={34}
            height={34}
            className="h-[34px] w-[34px]"
            priority
          />
          <span className="font-[family-name:var(--font-fredoka)] text-[1.35rem] font-semibold tracking-tight text-[#17164F]">
            EduNova
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex lg:gap-2">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={
                link.active
                  ? "rounded-full bg-[#F2EEFF] px-4 py-2 text-[0.92rem] font-bold text-[#5636D9]"
                  : "rounded-full px-4 py-2 text-[0.92rem] font-semibold text-[#17164F]/70 transition-colors hover:text-[#5636D9]"
              }
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={getRoleRoute(user.role)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#F2EEFF] px-4 py-2 text-sm font-bold text-[#5636D9] hover:bg-[#EAE5FF] transition-colors"
              >
                <span>👤 {user.alias}</span>
                <span className="text-[10px] uppercase font-bold bg-[#5636D9] text-white px-1.5 py-0.5 rounded-md">
                  {user.role === "TEACHER"
                    ? "Docente"
                    : user.role === "FAMILY_TUTOR"
                    ? "Familia"
                    : "Estudiante"}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Cerrar sesión"
                className="text-xs font-bold text-[#6B7280] hover:text-[#EF4444] p-1.5 transition-colors"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center rounded-xl border-[1.5px] border-[#17164F]/25 px-4 py-2.5 text-sm font-bold text-[#17164F] transition-colors hover:border-[#5636D9] hover:text-[#5636D9] sm:inline-flex"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#5636D9] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#4528b8]"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                  <path d="M10 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 12a4 4 0 0 0-4 4v1h12v-1a4 4 0 0 0-4-4H6Z" />
                  <path d="M15.5 6.5V5h-1v1.5H13v1h1.5V9h1V7.5H17v-1h-1.5Z" />
                </svg>
                Elegir Rol (Demo)
              </Link>
            </>
          )}

          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-[#17164F] md:hidden"
          >
            {open ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div id="mobile-nav" className="border-t border-[#F2EEFF] bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={
                  link.active
                    ? "rounded-xl bg-[#F2EEFF] px-4 py-3 text-sm font-bold text-[#5636D9]"
                    : "rounded-xl px-4 py-3 text-sm font-semibold text-[#17164F]/80"
                }
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="mt-1 rounded-xl bg-[#5636D9] text-white px-4 py-3 text-center text-sm font-bold sm:hidden"
            >
              Iniciar sesión / Elegir rol
            </Link>
            <div className="flex gap-2 pt-2">
              <Link
                href="/docente"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl bg-[#F2EEFF] py-2.5 text-center text-xs font-bold text-[#5636D9]"
              >
                Docente
              </Link>
              <Link
                href="/estudiante"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl bg-[#F2EEFF] py-2.5 text-center text-xs font-bold text-[#2DBE70]"
              >
                Estudiante
              </Link>
              <Link
                href="/familia"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl bg-[#F2EEFF] py-2.5 text-center text-xs font-bold text-[#E11D48]"
              >
                Familia
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
