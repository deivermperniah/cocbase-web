<script setup lang="ts">
import LegalPage from "@/components/ui/LegalPage.vue";

const sections = [
  {
    title: "Titular",
    body: "cocbase es un sitio web informativo y sin ánimo de lucro dedicado a recopilar, organizar y compartir diseños de bases de Clash of Clans, disponible en versión web y como aplicación móvil. Su responsable es Deiver Pernia. Para cualquier consulta, sugerencia o reclamación relacionada con el sitio puedes escribir a deivermph@gmail.com, indicando en el asunto el motivo de tu mensaje.",
  },
  {
    title: "Finalidad",
    body: "El sitio pone a disposición de la comunidad una colección de bases organizadas por nivel de ayuntamiento (del 3 al 18) y por categoría: Guerra, Liga, Mejora y Recursos. Cualquier visitante puede consultar las bases publicadas y copiarlas en el juego mediante su enlace oficial. Los usuarios registrados pueden además guardar bases en favoritos y enviar sus propios diseños, que se publican solo después de ser revisados por un administrador.",
  },
  {
    title: "Propiedad intelectual",
    body: "El diseño del sitio, su código, su logotipo y los textos propios de cocbase pertenecen a sus autores y no pueden reproducirse ni distribuirse con fines comerciales sin autorización. Las capturas de pantalla y los enlaces de bases enviados por los usuarios siguen perteneciendo a quien los creó; cocbase solo los muestra con el fin de compartirlos con la comunidad y no reclama su propiedad.",
  },
  {
    title: "Contenido de los usuarios",
    body: "Al enviar una base, el usuario declara que la captura y el enlace son suyos o que tiene permiso para compartirlos, y autoriza a cocbase a publicarlos junto con su nombre de usuario como diseñador. Cada envío queda en revisión hasta que un administrador lo aprueba o lo rechaza, pudiendo indicar el motivo del rechazo. cocbase puede rechazar o eliminar en cualquier momento bases duplicadas, capturas ilegibles, enlaces que no funcionen o contenido ofensivo, engañoso o que infrinja derechos de terceros. El usuario puede eliminar desde su cuenta los envíos que hayan sido rechazados.",
  },
  {
    title: "Responsabilidad",
    body: "cocbase se ofrece tal cual, sin garantías de disponibilidad continua ni de ausencia de errores. Las bases son aportes de la comunidad, por lo que no se garantiza su eficacia en el juego ni que sus enlaces sigan funcionando tras las actualizaciones de Clash of Clans. cocbase no se responsabiliza de los daños derivados del uso de la información publicada, de interrupciones del servicio ni de la pérdida de datos por causas ajenas a su control.",
  },
  {
    title: "Enlaces externos",
    body: "El sitio incluye enlaces a páginas de terceros, como los enlaces oficiales para copiar bases en Clash of Clans o las tiendas de aplicaciones para descargar la versión móvil. Al pulsarlos sales de cocbase, y el contenido, la disponibilidad y las políticas de privacidad de esos sitios dependen exclusivamente de sus titulares.",
  },
  {
    title: "Marcas de terceros",
    body: "Clash of Clans, sus nombres, imágenes y elementos gráficos son marcas y contenido de Supercell Oy. cocbase es un proyecto independiente de la comunidad y no está afiliado, patrocinado, respaldado ni aprobado por Supercell. Para más información consulta la política de contenido de fans de Supercell en supercell.com/fan-content-policy.",
  },
  {
    title: "Modificaciones",
    body: "cocbase puede actualizar este aviso legal para adaptarlo a cambios en el servicio o en la normativa aplicable. Las modificaciones se publicarán en esta misma página indicando la fecha de la última actualización. El uso del sitio después de publicarse los cambios supone su aceptación.",
  },
];
</script>

<template>
  <LegalPage title="Aviso legal" :sections="sections" />
</template>
