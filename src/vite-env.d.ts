/// <reference types="vite/client" />

interface Window {
  ENV?: {
    VITE_VAPI_PUBLIC_KEY?: string;
    [key: string]: string | undefined;
  }
}