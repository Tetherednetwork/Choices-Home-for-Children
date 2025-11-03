// This file is used to define types for Vite's `import.meta.env`
// Normally, this would be done with `/// <reference types="vite/client" />`
// but if that fails due to tsconfig issues, we can define it manually.

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
