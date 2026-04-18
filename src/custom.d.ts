// Типы для CSS/SCSS модулей
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { [key: string]: string };
  export default classes;
}

// Переменные для клиентской сборки (подставляются webpack DefinePlugin из process.env при сборке)
declare namespace NodeJS {
  interface ProcessEnv {
    readonly VITE_SUPABASE_URL?: string;
    readonly VITE_SUPABASE_ANON_KEY?: string;
    readonly VITE_SUPABASE_SERVICE_ROLE_KEY?: string;
    readonly VITE_USE_SUPABASE_STORAGE?: string;
    readonly VITE_STORAGE_BUCKET_NAME?: string;
    readonly SUPABASE_SERVICE_ROLE_KEY?: string;
  }
}

export {};
