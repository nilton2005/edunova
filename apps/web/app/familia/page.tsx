"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearStoredUser, getStoredUser } from "@/lib/auth";
import type { User } from "@edunova/shared-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const DEFAULT_FAMILY_USER: User = {
  id: "u-family-1",
  role: "FAMILY_TUTOR",
  alias: "Mamá de Gloria",
  classroomCode: "EDU-402",
};

export default function FamiliaPage() {
  const router = useRouter();
  const [user] = useState<User | null>(() => {
    if (typeof window === "undefined") return DEFAULT_FAMILY_USER;
    return getStoredUser() || DEFAULT_FAMILY_USER;
  });
  const [explainer, setExplainer] = useState<string | null>(null);
  const [loadingExplainer, setLoadingExplainer] = useState(false);

  const handleLogout = () => {
    clearStoredUser();
    router.push("/login");
  };

  const handleAskExplainer = async () => {
    setLoadingExplainer(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/family-home-explainer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: "Suma de fracciones con distinto denominador",
          studentAgeTier: "AVENTURERO_10_12",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setExplainer(data.explanation);
      } else {
        throw new Error();
      }
    } catch {
      // Fallback determinista (RNF-03)
      setExplainer(
        "🍎 Explicación casera con manzanas o pizza: Imagina que partes una pizza en 2 partes (1/2) y otra pizza del mismo tamaño en 4 partes (1/4). Para saber cuánta pizza tienes en total, no puedes sumar directamente 2 y 4 abajo. Primero corta la mitad en dos pedazos más pequeños: ahora tienes 2 cuartos. Sumas 2 cuartos + 1 cuarto = ¡3 cuartos de pizza en total!"
      );
    } finally {
      setLoadingExplainer(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4FF] text-[#17164F]">
      {/* Barra superior */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E8E0FF]">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/assets/logo.svg" alt="EduNova" width={32} height={32} />
            <span className="font-[family-name:var(--font-fredoka)] text-xl font-semibold text-[#17164F]">
              EduNova Familia
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 rounded-xl bg-[#F2EEFF] px-3.5 py-1.5 text-xs font-bold text-[#5636D9]">
              <span className="w-2 h-2 rounded-full bg-[#2DBE70]" />
              Aula EDU-402 vinculada
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#E11D48] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                MG
              </div>
              <span className="text-sm font-bold text-[#17164F] hidden md:inline">
                {user?.alias ?? "Mamá de Gloria"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-bold text-[#6B7280] hover:text-[#E11D48] transition-colors ml-2"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8 space-y-8">
        {/* Banner de bienvenida */}
        <div className="rounded-3xl bg-[linear-gradient(135deg,#5636D9_0%,#3B229D_100%)] p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm mb-3">
              <span>👨‍👩‍👧</span> Portal Guía Familiar
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-[family-name:var(--font-fredoka)]">
              Acompañando el aprendizaje de Gloria
            </h1>
            <p className="mt-2 text-white/80 text-sm leading-relaxed">
              Gloria está cursando el nivel <strong>Aventurera (10-12 años)</strong>. Aquí puedes ver su constancia diaria, consultar cómo explicarle temas difíciles y activar pactos de premios familiares.
            </p>
          </div>
          <div className="absolute right-4 bottom-2 opacity-20 sm:opacity-30 pointer-events-none">
            <Image src="/assets/woebling.png" alt="" width={160} height={160} />
          </div>
        </div>

        {/* Métricas clave en lenguaje cotidiano */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white p-5 border border-[#E8E0FF] shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-[#6B7280] mb-2">
              <span>Racha de días</span>
              <span>🔥</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#17164F]">5 días</div>
            <div className="text-xs text-[#2DBE70] font-bold mt-1">¡Constancia ejemplar!</div>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-[#E8E0FF] shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-[#6B7280] mb-2">
              <span>NovaCoins ganadas</span>
              <span>🪙</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#F0A020]">1,240</div>
            <div className="text-xs text-[#6B7280] mt-1">+150 en la última lección</div>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-[#E8E0FF] shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-[#6B7280] mb-2">
              <span>Estudio hoy</span>
              <span>⏱️</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#5636D9]">35 min</div>
            <div className="text-xs text-[#6B7280] mt-1">2 misiones completadas</div>
          </div>

          <div className="rounded-2xl bg-white p-5 border border-[#E8E0FF] shadow-sm">
            <div className="flex items-center justify-between text-xs font-semibold text-[#6B7280] mb-2">
              <span>Comparativa de red</span>
              <span>📈</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#2DBE70]">Top 22%</div>
            <div className="text-xs text-[#6B7280] mt-1">Percentil 78 en su edad</div>
          </div>
        </div>

        {/* Grid de dos columnas: Explicador IA + Pacto de Premios */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Tarjeta 1: ¿Cómo se lo explico en casa? */}
          <div className="rounded-3xl bg-white border border-[#E8E0FF] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5636D9] mb-2">
                <span>💡</span> Asistente Pedagógico para Padres
              </div>
              <h2 className="text-xl font-bold text-[#17164F]">¿Cómo se lo explico en casa hoy?</h2>
              <p className="text-xs text-[#6B7280] mt-1">
                La IA transforma conceptos técnicos en ejemplos de cocina, monedas o juguetes cotidianos listos para leerle a tu hijo en 1 minuto.
              </p>

              <div className="mt-4 p-4 rounded-2xl bg-[#F7F4FF] border border-[#E8E0FF]">
                <div className="text-xs font-bold text-[#5636D9] uppercase tracking-wide">
                  Tema activo que requiere apoyo:
                </div>
                <div className="font-bold text-sm text-[#17164F] mt-0.5">
                  Suma de Fracciones Heterogéneas (denominadores distintos)
                </div>
              </div>

              {explainer && (
                <div className="mt-4 p-4 rounded-2xl bg-[#E9F9F0] border border-[#A7F3D0] text-sm text-[#065F46] leading-relaxed animate-fadeIn">
                  <div className="font-bold text-xs uppercase tracking-wide mb-1 text-[#047857]">
                    Analogía lista para explicar:
                  </div>
                  {explainer}
                </div>
              )}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleAskExplainer}
                disabled={loadingExplainer}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#5636D9] hover:bg-[#4324bd] text-white font-bold text-sm shadow-[0_8px_20px_rgba(86,54,217,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loadingExplainer ? (
                  <span>Generando analogía sencilla...</span>
                ) : (
                  <>
                    <span>✨ Generar Explicación Casera (1 min)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tarjeta 2: Pacto de Recompensa Familiar */}
          <div className="rounded-3xl bg-white border border-[#E8E0FF] p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F0A020] mb-2">
                <span>🎯</span> Motivación Sana y Metas
              </div>
              <h2 className="text-xl font-bold text-[#17164F]">Pacto de Recompensa Familiar</h2>
              <p className="text-xs text-[#6B7280] mt-1">
                Acuerda una meta de constancia o puntos con tu hijo. Al lograrla, se desbloquea un cupón de premio real acordado en casa.
              </p>

              <div className="mt-4 p-5 rounded-2xl bg-[#FFF9E6] border border-[#FDE68A]">
                <div className="flex items-center justify-between text-xs font-bold text-[#92400E]">
                  <span>Pacto activo de la semana:</span>
                  <span className="bg-[#F59E0B] text-white px-2 py-0.5 rounded-full text-[10px]">En progreso</span>
                </div>
                <div className="font-extrabold text-base text-[#17164F] mt-1">
                  1,500 NovaCoins + Dominar Sistema Solar
                </div>
                <div className="text-xs text-[#92400E] mt-1">
                  Recompensa pactada: <strong>Tarde de cine con palomitas 🍿</strong>
                </div>

                {/* Barra de progreso */}
                <div className="mt-3">
                  <div className="flex justify-between text-[11px] font-bold text-[#6B7280] mb-1">
                    <span>1,240 / 1,500 NovaCoins</span>
                    <span>82%</span>
                  </div>
                  <div className="h-2.5 w-full bg-[#E5E7EB] rounded-full overflow-hidden">
                    <div className="h-full bg-[#F59E0B] rounded-full w-[82%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                href="/estudiante"
                className="flex-1 py-3 px-4 rounded-2xl border-2 border-[#5636D9] text-[#5636D9] hover:bg-[#F2EEFF] text-center text-xs font-bold transition-colors"
              >
                Ver lo que ve Gloria
              </Link>
              <Link
                href="/docente"
                className="flex-1 py-3 px-4 rounded-2xl bg-[#F2EEFF] text-[#17164F] hover:bg-[#EAE5FF] text-center text-xs font-bold transition-colors"
              >
                Ver panel docente
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
