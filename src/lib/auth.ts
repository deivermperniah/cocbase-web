import { ref, computed } from "vue";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export const session = ref<Session | null>(null);
export const user = ref<User | null>(null);

export interface Profile {
  id: string;
  full_name: string | null;
  role: "user" | "admin";
}

export const profile = ref<Profile | null>(null);

export const isAdmin = computed(() => profile.value?.role === "admin");

let initializationPromise: Promise<void> | null = null;

export function hasStoredSession() {
  try {
    return Object.keys(localStorage).some((key) => /^sb-.+-auth-token$/.test(key));
  } catch {
    return false;
  }
}

async function loadProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("id, full_name, role").eq("id", userId).maybeSingle();

  if (error) {
    console.error("Error loading profile:", error);
    return;
  }

  profile.value = data as Profile | null;
}

export function initializeAuth() {
  if (initializationPromise) return initializationPromise;

  initializationPromise = supabase.auth
    .getSession()
    .then(async ({ data, error }) => {
      if (error) throw error;

      session.value = data.session;
      user.value = data.session?.user ?? null;

      if (data.session?.user) {
        await loadProfile(data.session.user.id);
      }

      supabase.auth.onAuthStateChange((_event, nextSession) => {
        session.value = nextSession;
        user.value = nextSession?.user ?? null;

        if (nextSession?.user) {
          const userId = nextSession.user.id;
          setTimeout(() => loadProfile(userId), 0);
        } else {
          profile.value = null;
        }
      });
    })
    .catch((error) => {
      initializationPromise = null;
      throw error;
    });

  return initializationPromise;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  session.value = data.session;
  user.value = data.session.user;

  if (data.session?.user) {
    await loadProfile(data.session.user.id);
  }
}

export async function signUp(fullName: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  try {
    await supabase.auth.signOut({ scope: "local" });
  } catch (error) {
    console.warn("No se pudo cerrar la sesión remota; se limpiará la sesión local.", error);
  } finally {
    session.value = null;
    user.value = null;
    profile.value = null;
  }
}
