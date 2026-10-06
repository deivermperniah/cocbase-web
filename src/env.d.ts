interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_ANON_KEY: string;
  readonly PUBLIC_APP_APK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
