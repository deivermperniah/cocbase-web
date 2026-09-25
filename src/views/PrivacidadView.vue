<script setup lang="ts">
import LegalPage from "@/components/ui/LegalPage.vue";

const sections = [
  {
    title: "Responsable",
    body: "El responsable del tratamiento de tus datos es Deiver Pernia, titular de cocbase. Para cualquier cuestión relacionada con tu privacidad o con el ejercicio de tus derechos puedes escribir a deivermph@gmail.com.",
  },
  {
    title: "Datos que recopilamos",
    body: "Al registrarte recopilamos tu nombre y tu correo electrónico, y guardamos tu contraseña de forma cifrada; nunca tenemos acceso a ella en texto plano. Mientras usas el servicio almacenamos las bases que envías (captura, enlace, nivel, categoría y fecha), su estado de revisión y, si es rechazada, el motivo indicado por el administrador, además de la lista de bases que guardas en favoritos. No recopilamos datos de pago, ubicación ni contactos.",
  },
  {
    title: "Finalidad",
    body: "Usamos tus datos para crear y gestionar tu cuenta, permitir el inicio de sesión seguro, guardar y mostrar tus favoritos, revisar las bases que envías e informarte de su estado. Tu nombre se muestra públicamente como diseñador en las bases que se publican. No usamos tus datos para publicidad ni para crear perfiles comerciales.",
  },
  {
    title: "Base legal",
    body: "El tratamiento se basa en tu consentimiento al crear la cuenta, en la necesidad de prestarte el servicio que solicitas (gestionar tus favoritos y tus envíos) y en el interés legítimo de mantener la seguridad del sitio y evitar abusos. Puedes retirar tu consentimiento en cualquier momento solicitando la eliminación de tu cuenta.",
  },
  {
    title: "Conservación",
    body: "Conservamos tus datos mientras tu cuenta esté activa. Si solicitas su eliminación, borraremos tu cuenta, tus favoritos y tus envíos pendientes o rechazados. Las bases ya aprobadas pueden seguir publicadas sin tu nombre como diseñador, salvo que pidas expresamente que también se eliminen.",
  },
  {
    title: "Destinatarios",
    body: "Tus datos se almacenan en Supabase, que presta los servicios de base de datos, autenticación y almacenamiento de imágenes, en servidores ubicados en Estados Unidos. Supabase actúa como encargado del tratamiento y solo trata los datos para prestar ese servicio. No vendemos ni cedemos tus datos a terceros, salvo obligación legal.",
  },
  {
    title: "Tus derechos",
    body: "Puedes solicitar el acceso a tus datos, su rectificación o su supresión, oponerte a su tratamiento o limitarlo, y pedir su portabilidad, escribiendo a deivermph@gmail.com desde el correo asociado a tu cuenta. Responderemos en un plazo máximo de un mes. Si consideras que no hemos atendido correctamente tu solicitud, puedes presentar una reclamación ante la autoridad de protección de datos de tu país.",
  },
  {
    title: "Cookies",
    body: "El sitio no usa cookies publicitarias ni de seguimiento. Solo utiliza el almacenamiento local del navegador y cookies técnicas necesarias para mantener tu sesión iniciada, recordar tus preferencias y permitir que la aplicación funcione instalada en tu dispositivo, incluso con conexión limitada. Puedes borrarlas desde la configuración de tu navegador, aunque tendrás que volver a iniciar sesión.",
  },
];
</script>

<template>
  <LegalPage title="Política de privacidad" :sections="sections" />
</template>
