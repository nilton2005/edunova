import type { User, UserRole } from "@edunova/shared-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const DEMO_USERS: (User & { description: string; avatarBg: string; badge: string })[] = [
  {
    id: "u-teacher-1",
    role: "TEACHER",
    alias: "Profe Ana",
    classroomCode: "EDU-402",
    description: "Docente de Matemática 1B",
    avatarBg: "bg-[#5636D9]",
    badge: "Docente",
  },
  {
    id: "u-student-1",
    role: "STUDENT",
    alias: "Gloria",
    ageTier: "AVENTURERO_10_12",
    classroomCode: "EDU-402",
    description: "10-12 años · Aventurera",
    avatarBg: "bg-[#2DBE70]",
    badge: "Estudiante",
  },
  {
    id: "u-student-2",
    role: "STUDENT",
    alias: "Mateo",
    ageTier: "EXPLORADOR_7_9",
    classroomCode: "EDU-402",
    description: "7-9 años · Explorador",
    avatarBg: "bg-[#4C9EFF]",
    badge: "Estudiante",
  },
  {
    id: "u-student-3",
    role: "STUDENT",
    alias: "Sofía",
    ageTier: "CREADOR_13_15",
    classroomCode: "EDU-402",
    description: "13-15 años · Creadora",
    avatarBg: "bg-[#F0A020]",
    badge: "Estudiante",
  },
  {
    id: "u-family-1",
    role: "FAMILY_TUTOR",
    alias: "Mamá de Gloria",
    classroomCode: "EDU-402",
    description: "Tutor familiar vinculado a Gloria",
    avatarBg: "bg-[#E11D48]",
    badge: "Tutor Familiar",
  },
];

export function getRoleRoute(role: UserRole): string {
  switch (role) {
    case "TEACHER":
      return "/docente";
    case "FAMILY_TUTOR":
      return "/familia";
    case "STUDENT":
    default:
      return "/estudiante";
  }
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("edunova_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("edunova_user", JSON.stringify(user));
  } catch (e) {
    console.error("Error guardando usuario:", e);
  }
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("edunova_user");
    localStorage.removeItem("edunova_token");
  } catch (e) {
    console.error("Error borrando sesión:", e);
  }
}

export async function loginUser(params: {
  userId?: string;
  alias?: string;
  classroomCode?: string;
  role?: string;
}): Promise<{ user: User; redirectUrl: string }> {
  // 1. Intentar conectar con la API de Express
  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (typeof window !== "undefined") {
        setStoredUser(data.user);
        if (data.token) localStorage.setItem("edunova_token", data.token);
      }
      return {
        user: data.user,
        redirectUrl: data.redirectUrl || getRoleRoute(data.user.role),
      };
    }
  } catch {
    // Si la API falla (modo offline en auditorio), recurrimos al modo determinista local
  }

  // 2. Fallback determinista local (RNF-03: Tolerancia a fallos en demo)
  const cleanAlias = params.alias?.trim().toLowerCase();
  const cleanCode = params.classroomCode?.trim().toUpperCase();

  const fallbackUser = DEMO_USERS.find((u) => {
    if (params.userId && u.id === params.userId) return true;
    if (params.role && !params.alias && !params.userId && u.role === params.role) return true;
    if (cleanAlias && u.alias.toLowerCase() === cleanAlias) {
      if (!cleanCode) return true;
      return u.classroomCode?.toUpperCase() === cleanCode;
    }
    return false;
  });

  if (!fallbackUser) {
    throw new Error(
      "Usuario no encontrado. Prueba con 'Gloria', 'Mateo', 'Sofía', 'Profe Ana' o código 'EDU-402'."
    );
  }

  setStoredUser(fallbackUser);
  return {
    user: fallbackUser,
    redirectUrl: getRoleRoute(fallbackUser.role),
  };
}

