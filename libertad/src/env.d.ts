/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `artifact` cuando se construye para publicar en un visor sin barra de direcciones. */
  readonly VITE_DESTINO?: 'artifact'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
