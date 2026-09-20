<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-vue-next'
import Alert from '@/components/ui/alert/Alert.vue'
import AlertDescription from '@/components/ui/alert/AlertDescription.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import logo from '@/assets/logo.png'
import { signIn } from '@/lib/auth'

const route = useRoute()
const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const isSubmitting = ref(false)

async function handleSubmit() {
  errorMessage.value = ''
  isSubmitting.value = true

  try {
    await signIn(email.value.trim(), password.value)
    const redirect = typeof route.query.redirect === 'string'
      && route.query.redirect.startsWith('/')
      && !route.query.redirect.startsWith('//')
      ? route.query.redirect
      : '/'
    await router.replace(redirect)
  } catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'No se pudo iniciar sesión.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-12 sm:px-10">
    <section class="relative w-full max-w-md overflow-hidden rounded-[2.5rem] p-px shadow-2xl shadow-yellow-500/10">
      <div class="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_58%,#eab308_72%,#facc15_80%,transparent_92%)]" />
      <div class="relative rounded-[calc(2.5rem-1px)] bg-zinc-950 p-6 sm:p-8">
        <div class="mb-4 text-center">
          <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center">
            <img :src="logo" alt="logo" class="h-full w-full object-contain" />
          </div>
          <h2 class="text-xl font-black italic tracking-tighter uppercase text-white">
            Iniciar sesión
          </h2>
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <Alert v-if="errorMessage" variant="destructive" class="rounded-lg border-red-500/40 bg-red-500/10 text-red-300">
            <AlertDescription class="text-red-300">{{ errorMessage }}</AlertDescription>
          </Alert>

          <div class="space-y-2">
            <label for="email" class="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Correo electrónico *</label>
            <Input id="email" v-model="email" type="email" autocomplete="email" placeholder="jose20003@gmail.com" required class="!h-12 !rounded-lg !border-zinc-800 !bg-zinc-900 !text-white !placeholder:text-zinc-600 focus-visible:!border-yellow-500 focus-visible:!ring-yellow-500/20" />
          </div>

          <div class="space-y-2">
            <label for="password" class="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-500">Contraseña *</label>
            <div class="relative">
              <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" :placeholder="showPassword ? '12345678' : '••••••••'" autocomplete="current-password" required class="!h-12 !rounded-lg !border-zinc-800 !bg-zinc-900 !text-white !placeholder:text-zinc-600 focus-visible:!border-yellow-500 focus-visible:!ring-yellow-500/20 !pr-12" />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-500 transition-colors hover:text-white"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="showPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <Button type="submit" class="w-full h-[44px] cursor-pointer rounded-full bg-yellow-500 text-zinc-950 font-black uppercase tracking-[0.15em] text-[10px] hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-xl shadow-yellow-500/10" :disabled="isSubmitting">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            <LogIn v-else class="mr-2 h-4 w-4" />
            {{ isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión' }}
          </Button>
        </form>

      </div>
    </section>
  </main>
</template>