import { computed, ref } from "vue";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  full_name: string | null;
  role: "user" | "admin";
}

export type Access = "auth" | "admin" | "user" | "guest";

export const session = ref<Session | null>(null);
export const user = ref<User | null>(null);
export const profile = ref<Profile | null>(null);

export const isAdmin = computed(() => profile.value?.role === "admin");

let initialization: Promise<void> | null = null;

async function loadProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("id, full_name, role").eq("id", userId).maybeSingle();
  if (error) console.error("Error loading profile:", error);
  profile.value = data as Profile | null;
}

async function setSession(next: Session | null) {
  session.value = next;
  user.value = next?.user ?? null;
  if (next?.user) await loadProfile(next.user.id);
  else profile.value = null;
}

export function initializeAuth() {
  initialization ??= supabase.auth.getSession().then(async ({ data }) => {
    await setSession(data.session);
    supabase.auth.onAuthStateChange((_event, next) => {
      if (next?.user.id === user.value?.id) {
        session.value = next;
        return;
      }
      setTimeout(() => setSession(next), 0);
    });
  });
  return initialization;
}

export function loginUrl(redirect: string) {
  return `/login?redirect=${encodeURIComponent(redirect)}`;
}

export function getAccessRedirect(access: Access, path: string): string | null {
  if (access === "guest") return session.value ? "/" : null;
  if (!session.value) return loginUrl(path);
  if (access === "admin" && !isAdmin.value) return "/";
  if (access === "user" && isAdmin.value) return "/panel";
  return null;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  await setSession(data.session);
}

export async function signUp(fullName: string, email: string, password: string) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });
  if (error) throw error;
}

export async function signOut() {
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch (error) {
    console.warn("No se pudo cerrar la sesión remota; se limpiará la sesión local.", error);
  } finally {
    await setSession(null);
  }
}
