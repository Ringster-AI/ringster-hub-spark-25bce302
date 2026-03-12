/**
 * Returns the base URL for Netlify functions.
 * When running on Netlify (production), uses relative paths.
 * When running elsewhere (e.g., Lovable preview), uses the configured VITE_NETLIFY_URL.
 */
export function getNetlifyFunctionsUrl(functionName: string): string {
  const netlifyBaseUrl = import.meta.env.VITE_NETLIFY_URL;
  
  if (netlifyBaseUrl) {
    // Running outside Netlify - use the full URL
    return `${netlifyBaseUrl}/.netlify/functions/${functionName}`;
  }
  
  // Running on Netlify - use relative path
  return `/.netlify/functions/${functionName}`;
}
