
/**
 * Utility functions for accessing environment variables
 */

export const getEnvVar = (key: string): string | undefined => {
  // Try different ways to access environment variables
  let value: string | undefined;
  
  // First try import.meta.env (Vite's preferred method)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    value = import.meta.env[key];
    if (value) {
      console.log(`Found ${key} via import.meta.env`);
      return value;
    }
  }
  
  // Try window.ENV (for runtime configuration)
  if (typeof window !== 'undefined' && window.ENV) {
    value = window.ENV[key];
    if (value) {
      console.log(`Found ${key} via window.ENV`);
      return value;
    }
  }
  
  // Try process.env (though this might not work in browser)
  if (typeof process !== 'undefined' && process.env) {
    value = process.env[key];
    if (value) {
      console.log(`Found ${key} via process.env`);
      return value;
    }
  }
  
  console.warn(`Environment variable ${key} not found in any source`);
  console.log('Available import.meta.env keys:', typeof import.meta !== 'undefined' ? Object.keys(import.meta.env || {}) : 'import.meta not available');
  
  return undefined;
};

export const getVapiPublicKey = (): string | undefined => {
  const key = getEnvVar('VITE_VAPI_PUBLIC_KEY');
  console.log('VITE_VAPI_PUBLIC_KEY result:', key ? 'Found' : 'Not found');
  return key;
};

export const getSupabaseUrl = (): string | undefined => {
  return getEnvVar('VITE_SUPABASE_URL');
};

export const getSupabaseAnonKey = (): string | undefined => {
  return getEnvVar('VITE_SUPABASE_ANON_KEY');
};
