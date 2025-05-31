
/**
 * Utility functions for accessing environment variables
 */

export const getEnvVar = (key: string): string | undefined => {
  // Try different ways to access environment variables
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[key];
  }
  
  if (typeof window !== 'undefined' && window.ENV) {
    return window.ENV[key];
  }
  
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  
  return undefined;
};

export const getVapiPublicKey = (): string | undefined => {
  return getEnvVar('VITE_VAPI_PUBLIC_KEY');
};

export const getSupabaseUrl = (): string | undefined => {
  return getEnvVar('VITE_SUPABASE_URL');
};

export const getSupabaseAnonKey = (): string | undefined => {
  return getEnvVar('VITE_SUPABASE_ANON_KEY');
};
