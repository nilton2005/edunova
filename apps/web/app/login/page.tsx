"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DEMO_USERS, loginUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"quick" | "code">("quick");
  const [alias, setAlias] = useState("");
  const [classroomCode, setClassroomCode] = useState("EDU-402");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleQuickLogin = async (userId: string) => {
    setLoadingId(userId);
    setError(null);
    try {
      const res = await loginUser({ userId });
      router.push(res.redirectUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
      setLoadingId(null);
    }
  };

  const handleCodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alias.trim()) {
      setError("Por favor ingresa tu nombre o alias.");
      return;
    }
    setLoadingId("form");
    setError(null);
    try {
      const res = await loginUser({ alias, classroomCode });
      router.push(res.redirectUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#F7F4FF_0%,#EEF3FF_45%,#F8F7FC_100%)] flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Botón regresar */}
      <div className="w-full max-w-2xl mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-[#5636D9] hover:text-[#4324bd] transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
              clipRule="evenodd"
            />
          </svg>
          Volver al inicio
        </Link>
      </div>

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(86,54,217,0.12)] border border-[#E8E0FF] p-6 sm:p-10">
        {/* Cabecera del login */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <Image src="/assets/logo.svg" alt="EduNova" width={40} height={40} />
            <span className="font-[family-name:var(--font-fredoka)] text-2xl font-semibold text-[#17164F]">
              EduNova
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#17164F]">
            Elige cómo deseas ingresar
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Acceso seguro y adaptado por rol para docentes, estudiantes y familias.
          </p>
        </div>

        {/* Selector de pestañas */}
        <div className="flex rounded-2xl bg-[#F2EEFF] p-1.5 mb-8">
          <button
            type="button"
            onClick={() => {
              setTab("quick");
              setError(null);
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
              tab === "quick"
                ? "bg-white text-[#5636D9] shadow-sm"
                : "text-[#17164F]/70 hover:text-[#17164F]"
            }`}
          >
            ⚡ Acceso Rápido Demo (1-Click)
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("code");
              setError(null);
            }}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${
              tab === "code"
                ? "bg-white text-[#5636D9] shadow-sm"
                : "text-[#17164F]/70 hover:text-[#17164F]"
            }`}
          >
            🔑 Código de Aula
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-[#FEE2E2] border border-[#FCA5A5] p-4 text-sm text-[#991B1B] flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* PESTAÑA 1: ACCESO RÁPIDO DEMO */}
        {tab === "quick" && (
          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#6B7280] mb-2">
              Selecciona uno de los usuarios de prueba:
            </div>

            <div className="grid gap-3 sm:grid-cols-1">
              {DEMO_USERS.map((u) => {
                const isLoading = loadingId === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickLogin(u.id)}
                    disabled={Boolean(loadingId)}
                    className="flex items-center justify-between p-4 rounded-2xl border-2 border-[#E8E0FF] bg-white hover:border-[#5636D9] hover:bg-[#F7F4FF] transition-all text-left group disabled:opacity-50"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl ${u.avatarBg} text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0`}
                      >
                        {u.alias.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#17164F] group-hover:text-[#5636D9] transition-colors">
                            {u.alias}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EAE5FF] text-[#5636D9]">
                            {u.badge}
                          </span>
                          {u.classroomCode && (
                            <span className="text-[10px] font-semibold text-[#6B7280] bg-gray-100 px-2 py-0.5 rounded-md">
                              {u.classroomCode}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#6B7280] mt-0.5">{u.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-block text-xs font-bold text-[#5636D9]">
                        {isLoading ? "Ingresando..." : "Entrar →"}
                      </span>
                      <div className="w-8 h-8 rounded-full bg-[#F2EEFF] flex items-center justify-center group-hover:bg-[#5636D9] group-hover:text-white transition-colors text-[#5636D9]">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path
                            fillRule="evenodd"
                            d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PESTAÑA 2: CÓDIGO DE AULA */}
        {tab === "code" && (
          <form onSubmit={handleCodeLogin} className="space-y-5">
            <div>
              <label htmlFor="alias" className="block text-xs font-bold uppercase tracking-wider text-[#17164F] mb-1.5">
                Tu Nombre o Alias
              </label>
              <input
                id="alias"
                type="text"
                placeholder="Ejemplo: Gloria, Mateo o Profe Ana"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                className="w-full rounded-2xl border-2 border-[#E8E0FF] px-4 py-3 text-sm text-[#17164F] placeholder-[#9CA3AF] focus:border-[#5636D9] focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-[#6B7280] mt-1">
                Safe-Play: Usa tu alias registrado o nombre de pila sin apellidos.
              </p>
            </div>

            <div>
              <label htmlFor="classroomCode" className="block text-xs font-bold uppercase tracking-wider text-[#17164F] mb-1.5">
                Código de Aula (6 caracteres)
              </label>
              <input
                id="classroomCode"
                type="text"
                placeholder="Ejemplo: EDU-402"
                value={classroomCode}
                onChange={(e) => setClassroomCode(e.target.value)}
                className="w-full rounded-2xl border-2 border-[#E8E0FF] px-4 py-3 text-sm font-mono uppercase tracking-wider text-[#17164F] placeholder-[#9CA3AF] focus:border-[#5636D9] focus:outline-none transition-colors"
              />
              <p className="text-[11px] text-[#6B7280] mt-1">
                Código provisto por tu docente (código demo: <span className="font-bold text-[#5636D9]">EDU-402</span>).
              </p>
            </div>

            <button
              type="submit"
              disabled={loadingId === "form"}
              className="w-full py-4 rounded-2xl bg-[#5636D9] hover:bg-[#4324bd] text-white font-bold text-sm shadow-[0_10px_25px_rgba(86,54,217,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingId === "form" ? (
                <span>Validando credenciales...</span>
              ) : (
                <>
                  <span>Ingresar al Aula</span>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer informativo */}
        <div className="mt-8 pt-6 border-t border-[#F2EEFF] text-center text-xs text-[#6B7280]">
          Protección Safe-Play · Sin contraseñas complejas · Cumplimiento MINEDU & ProFuturo
        </div>
      </div>
    </div>
  );
}
