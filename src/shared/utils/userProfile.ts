export interface UserProfile {
  id?: number;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  role_name?: string | null;
}

export const USER_PROFILE_KEY = "user_profile";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Lee el perfil guardado; si no existe (sesiones previas) usa el login como email. */
export function readStoredProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (raw) return JSON.parse(raw) as UserProfile;
  } catch {
    /* perfil corrupto: se ignora */
  }
  const login = localStorage.getItem("user");
  return login ? { email: login } : null;
}

export function getFullName(p: UserProfile | null): string {
  if (!p) return "Usuario";
  const full = [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
  return full || p.email;
}

/** Nombre corto para saludos: primer nombre o la parte local del correo. */
export function getFirstName(p: UserProfile | null): string {
  if (!p) return "usuario";
  if (p.first_name) return capitalize(p.first_name.trim().split(/\s+/)[0].toLowerCase());
  const local = p.email.split("@")[0].split(/[._-]/)[0];
  return capitalize(local || "usuario");
}

export function getInitials(p: UserProfile | null): string {
  if (!p) return "U";
  if (p.first_name || p.last_name) {
    return `${p.first_name?.[0] ?? ""}${p.last_name?.[0] ?? ""}`.toUpperCase() || "U";
  }
  return (p.email[0] ?? "U").toUpperCase();
}
