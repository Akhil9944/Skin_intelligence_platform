/**
 * Dynamic API Base URL helper
 * In cloud production (Vercel): Reads NEXT_PUBLIC_API_URL pointing to the backend (e.g. Render).
 * In local dev / Docker: Automatically matches the browser's hostname (localhost, 127.0.0.1, or network IP)
 * so requests never fail due to hostname or IPv4/IPv6 mismatches.
 */
export const getApiBase = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname || "127.0.0.1";
    return `http://${host}:8001`;
  }
  return "http://127.0.0.1:8001";
};
