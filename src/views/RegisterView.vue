<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import IconSync from '~icons/ph/arrows-clockwise'
import IconUserPlus from '~icons/ph/user-plus'
import IconEye from '~icons/ph/eye'
import IconEyeOff from '~icons/ph/eye-slash'
import IconX from '~icons/ph/x'
import Alert from '@/components/ui/alert/Alert.vue'
import AlertDescription from '@/components/ui/alert/AlertDescription.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import logo from '@/assets/logo.png'
import { signUp } from '@/lib/auth'

const router = useRouter()
const fullName = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isSubmitting = ref(false)

function goBack() {
  router.replace('/')
}

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''
  isSubmitting.value = true

  try {
    await signUp(fullName.value.trim(), email.value.trim(), password.value)
    successMessage.value = 'Revisa tu correo para confirmar la cuenta y entrar.'
  } catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'No se pudo crear la cuenta.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-12 sm:px-10">
    <button
      type="button"
      class="absolute right-5 top-5 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-yellow-400/40 hover:text-yellow-400 sm:right-8 sm:top-8"
      aria-label="Volver"
      @click="goBack"
    >
      <IconX class="h-5 w-5" />
    </button>

    <section class="relative w-full max-w-md overflow-hidden rounded-[1.25rem] p-px shadow-2xl shadow-yellow-400/10">
      <div class="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,transparent_58%,var(--primary)_72%,var(--color-yellow-300)_80%,transparent_92%)]" />
      <div class="relative rounded-[calc(1.25rem-1px)] bg-card p-6 sm:p-8">
        <div class="mb-page text-center">
          <div class="mx-auto mb-page flex h-16 w-16 items-center justify-center">
            <img :src="logo" alt="logo" class="h-full w-full object-contain" />
          </div>
          <h2 class="text-[28px] text-yellow-400">Crear cuenta</h2>
        </div>

        <form class="space-y-page" @submit.prevent="handleSubmit">
          <Alert v-if="errorMessage" variant="destructive" class="rounded-lg border-red-500/40 bg-red-500/10 text-red-300">
            <AlertDescription class="text-red-300">{{ errorMessage }}</AlertDescription>
          </Alert>

          <Alert v-if="successMessage" class="rounded-lg border-yellow-400/40 bg-yellow-400/10">
            <AlertDescription class="text-yellow-300">{{ successMessage }}</AlertDescription>
          </Alert>

          <div class="space-y-2">
            <label for="fullName" class="text-xs text-muted-foreground">Nombre completo *</label>
            <Input id="fullName" v-model="fullName" type="text" autocomplete="name" placeholder="Tu nombre" required class="!h-[44px] !rounded-lg !border-border !bg-secondary !text-white !placeholder:text-muted-foreground focus-visible:!border-yellow-400 focus-visible:!ring-yellow-400/20" />
          </div>

          <div class="space-y-2">
            <label for="email" class="text-xs text-muted-foreground">Correo electrónico *</label>
            <Input id="email" v-model="email" type="email" autocomplete="email" placeholder="tucorreo@ejemplo.com" required class="!h-[44px] !rounded-lg !border-border !bg-secondary !text-white !placeholder:text-muted-foreground focus-visible:!border-yellow-400 focus-visible:!ring-yellow-400/20" />
          </div>

          <div class="space-y-2">
            <label for="password" class="text-xs text-muted-foreground">Contraseña *</label>
            <div class="relative">
              <Input id="password" v-model="password" :type="showPassword ? 'text' : 'password'" :placeholder="showPassword ? '12345678' : '••••••••'" autocomplete="new-password" required class="!h-[44px] !rounded-lg !border-border !bg-secondary !text-white !placeholder:text-muted-foreground focus-visible:!border-yellow-400 focus-visible:!ring-yellow-400/20 !pr-12" />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-white"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                @click="showPassword = !showPassword"
              >
                <IconEye v-if="showPassword" class="h-4 w-4" />
                <IconEyeOff v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <Button type="submit" class="w-full h-[44px] cursor-pointer rounded-full bg-yellow-400 text-black text-xs hover:bg-yellow-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-xl shadow-yellow-400/10" :disabled="isSubmitting">
            <IconSync v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            <IconUserPlus v-else class="mr-2 h-4 w-4" />
            {{ isSubmitting ? 'Creando cuenta...' : 'Crear cuenta' }}
          </Button>
        </form>

        <p class="mt-6 text-center text-xs text-muted-foreground">
          ¿Ya tienes cuenta?
          <router-link to="/login" class="text-yellow-400 hover:text-yellow-300 transition-colors">Inicia sesión</router-link>
        </p>
      </div>
    </section>
  </main>
</template>
