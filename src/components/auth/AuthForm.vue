<script setup lang="ts">
import { reactive, ref } from "vue";
import IconSignIn from "~icons/ph/sign-in";
import IconUserPlus from "~icons/ph/user-plus";
import AuthGate from "@/components/auth/AuthGate.vue";
import AppButton from "@/components/ui/AppButton.vue";
import FormField from "@/components/ui/FormField.vue";
import { signIn, signUp } from "@/lib/auth";

const props = defineProps<{ mode: "login" | "register" }>();

const isLogin = props.mode === "login";
const form = reactive({ fullName: "", email: "", password: "" });
const errorMessage = ref("");
const successMessage = ref("");
const isSubmitting = ref(false);

function getRedirect() {
  const redirect = new URLSearchParams(window.location.search).get("redirect");
  return redirect?.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";
}

async function handleSubmit() {
  errorMessage.value = "";
  successMessage.value = "";
  isSubmitting.value = true;

  try {
    if (isLogin) {
      await signIn(form.email.trim(), form.password);
      window.location.replace(getRedirect());
    } else {
      await signUp(form.fullName.trim(), form.email.trim(), form.password);
      successMessage.value = "Revisa tu correo para confirmar la cuenta y entrar";
    }
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "No se pudo completar la acción";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <AuthGate access="guest" />

  <form class="space-y-page" @submit.prevent="handleSubmit">
    <p v-if="errorMessage" class="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
      {{ errorMessage }}
    </p>
    <p v-if="successMessage" class="rounded-lg border border-primary/40 bg-primary/10 p-3 text-sm text-yellow-300">
      {{ successMessage }}
    </p>

    <FormField
      v-if="!isLogin"
      v-model="form.fullName"
      label="Nombre completo *"
      autocomplete="name"
      placeholder="Tu nombre"
      required
    />
    <FormField
      v-model="form.email"
      label="Correo electrónico *"
      type="email"
      autocomplete="email"
      placeholder="tucorreo@ejemplo.com"
      required
    />
    <FormField
      v-model="form.password"
      label="Contraseña *"
      type="password"
      :autocomplete="isLogin ? 'current-password' : 'new-password'"
      placeholder="••••••••"
      required
    />

    <AppButton type="submit" :icon="isLogin ? IconSignIn : IconUserPlus" :loading="isSubmitting" class="w-full">
      {{ isLogin ? "Iniciar sesión" : "Crear cuenta" }}
    </AppButton>
  </form>

  <p class="mt-6 text-center text-xs text-muted-foreground">
    {{ isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?" }}
    <a :href="isLogin ? '/register' : '/login'" class="text-primary hover:text-yellow-300">
      {{ isLogin ? "Crea una" : "Inicia sesión" }}
    </a>
  </p>
</template>
