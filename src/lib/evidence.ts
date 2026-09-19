// =====================================================
// Sistema de evidencia externa — compartido por TODOS los juegos
// =====================================================
//
// Los 6 niveles del juego usan el mismo mecanismo de evidencia:
// el estudiante sube su foto o vídeo a una carpeta de Google Drive
// mediante un enlace externo.
//
// POR QUÉ ES EXTERNO
// La aplicación NO almacena fotografías ni vídeos, ni en el dispositivo
// ni en Supabase. Los participantes son menores de edad, así que la
// evidencia se gestiona fuera de la aplicación por privacidad. Lo único
// que se guarda en la base de datos es si el estudiante confirmó haberla
// subido (un booleano), nunca el archivo ni datos de terceros.
//
// CÓMO CONFIGURARLA
// Define la variable VITE_EVIDENCE_DRIVE_URL en el archivo .env con el
// enlace de tu carpeta de Google Drive. Ejemplo:
//
//   VITE_EVIDENCE_DRIVE_URL=https://drive.google.com/drive/folders/TU_ID
//
// Si la variable no está definida, se usa la URL de respaldo de abajo.

/** URL de respaldo si no se define la variable de entorno */
const FALLBACK_DRIVE_URL = 'https://drive.google.com/drive/home'

/**
 * Enlace a la carpeta de Google Drive donde los estudiantes suben su
 * evidencia. Se lee desde la variable de entorno para poder cambiarla
 * sin tocar el código ni volver a compilar.
 */
export const EVIDENCE_DRIVE_URL: string =
  import.meta.env.VITE_EVIDENCE_DRIVE_URL || FALLBACK_DRIVE_URL

/**
 * Indica si la URL configurada es válida y navegable.
 * Se usa para deshabilitar el botón de evidencia en lugar de abrir un
 * enlace roto cuando la configuración todavía no está lista.
 */
export const isEvidenceUrlConfigured: boolean =
  EVIDENCE_DRIVE_URL.startsWith('https://') || EVIDENCE_DRIVE_URL.startsWith('http://')
