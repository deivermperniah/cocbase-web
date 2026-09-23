<script setup lang="ts">
const sections = [
  {
    title: "Responsable",
    body: "El responsable del tratamiento de los datos es cocbase. Puedes contactar en deivermph@gmail.com para cualquier cuestión relacionada con tu privacidad.",
  },
  {
    title: "Datos que recopilamos",
    body: "Al registrarte recopilamos tu nombre y tu correo electrónico. También almacenamos las bases que envías, tus favoritos y la fecha de tus interacciones con el sitio.",
  },
  {
    title: "Finalidad",
    body: "Usamos tus datos para gestionar tu cuenta, mostrar tus favoritos, revisar y publicar las bases que envías y permitir el inicio de sesión seguro.",
  },
  {
    title: "Base legal",
    body: "El tratamiento se basa en tu consentimiento al crear la cuenta y en el interés legítimo de mantener el funcionamiento y la seguridad del servicio.",
  },
  {
    title: "Conservación",
    body: "Conservamos tus datos mientras tu cuenta esté activa. Puedes solicitar su eliminación en cualquier momento escribiendo al correo de contacto.",
  },
  {
    title: "Destinatarios",
    body: "Los datos se almacenan en Supabase, que actúa como proveedor de infraestructura. No cedemos tus datos a terceros con fines publicitarios.",
  },
  {
    title: "Tus derechos",
    body: "Puedes solicitar el acceso, la rectificación o la supresión de tus datos, así como oponerte a su tratamiento o solicitar su portabilidad, escribiendo a deivermph@gmail.com.",
  },
  {
    title: "Cookies",
    body: "El sitio utiliza almacenamiento local y cookies técnicas necesarias para mantener la sesión iniciada y el funcionamiento de la aplicación instalable. No usamos cookies publicitarias.",
  },
];
</script>

<template>
  <div class="max-w-3xl space-y-[15px] animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
    <h2 class="text-[28px] text-yellow-400">Política de privacidad</h2>
    <p class="text-xs text-muted-foreground">Última actualización: septiembre de 2026.</p>

    <div class="space-y-[15px]">
      <section v-for="section in sections" :key="section.title" class="space-y-2">
        <h3 class="text-base text-white">{{ section.title }}</h3>
        <p class="font-body text-sm text-muted-foreground leading-relaxed">{{ section.body }}</p>
      </section>
    </div>
  </div>
</template>
