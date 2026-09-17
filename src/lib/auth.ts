import { ref } from 'vue'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase() ?? ''

export const session = ref<Session | null>(null)
export const isAuthInitialized = ref(false)

let authSubscription: { unsubscribe: () => void } | null = null
let initializationPromise: Promise<void> | null = null

export function isAuthorizedUser(currentSession: Session | null) {
  if (!currentSession?.user) return false
  return Boolean(adminEmail) && currentSession.user.email?.toLowerCase() === adminEmail
}

export function initializeAuth() {
  if (initializationPromise) return initializationPromise

  initializationPromise = supabase.auth.getSession().then(async ({ data, error }) => {
    if (error) throw error

    session.value = isAuthorizedUser(data.session) ? data.session : null
    if (data.session && !session.value) {
      await supabase.auth.signOut()
    }

    if (!authSubscription) {
      const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        session.value = isAuthorizedUser(nextSession) ? nextSession : null
      })
      authSubscription = subscription.subscription
    }

    isAuthInitialized.value = true
  }).catch((error) => {
    initializationPromise = null
    isAuthInitialized.value = true
    throw error
  })

  return initializationPromise
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error

  if (!isAuthorizedUser(data.session)) {
    await supabase.auth.signOut({ scope: 'local' })
    throw new Error('Esta cuenta no tiene permisos de administrador.')
  }

  session.value = data.session
}

export async function signOut() {
  try {
    await supabase.auth.signOut({ scope: 'local' })
  } catch (error) {
    console.warn('No se pudo cerrar la sesión remota; se limpiará la sesión local.', error)
  } finally {
    session.value = null
  }
}