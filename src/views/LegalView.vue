<script setup lang="ts">
import LegalPage from "@/components/ui/LegalPage.vue";

const sections = [
  {
    title: "Titular",
    body: "cocbase es un sitio web informativo dedicado a recopilar y compartir diseños de bases de Clash of Clans. Para cualquier consulta puedes escribir a deivermph@gmail.com.",
  },
  {
    title: "Finalidad",
    body: "El sitio pone a disposición de la comunidad una colección de bases organizadas por nivel de ayuntamiento y categoría, permitiendo a los usuarios registrados guardar favoritos y enviar sus propios diseños.",
  },
  {
    title: "Propiedad intelectual",
    body: "El diseño, el código y los contenidos propios de cocbase pertenecen a sus autores. Las imágenes y enlaces de bases enviados por los usuarios son responsabilidad de quien los publica.",
  },
  {
    title: "Contenido de los usuarios",
    body: "Al enviar una base, el usuario declara contar con los derechos necesarios sobre el contenido y autoriza su publicación en el sitio. cocbase puede revisar, aprobar, rechazar o eliminar cualquier contenido que incumpla estas condiciones.",
  },
  {
    title: "Responsabilidad",
    body: "cocbase no garantiza la disponibilidad continua del servicio ni la exactitud de los enlaces de terceros. El uso de la información publicada es responsabilidad del usuario.",
  },
  {
    title: "Enlaces externos",
    body: "El sitio puede incluir enlaces a páginas de terceros. cocbase no se hace responsable del contenido ni de las políticas de dichos sitios.",
  },
  {
    title: "Marcas de terceros",
    body: "Clash of Clans es una marca registrada de Supercell Oy. cocbase es un proyecto de la comunidad y no está afiliado, patrocinado ni respaldado por Supercell.",
  },
  {
    title: "Modificaciones",
    body: "cocbase puede actualizar este aviso legal en cualquier momento. Las modificaciones se publicarán en esta misma página.",
  },
];
</script>

<template>
  <LegalPage title="Aviso legal" :sections="sections" />
</template>
