const DEFAULT_HTTP_BACKEND = "http://localhost:3001";
const DEFAULT_WS_URL = "ws://localhost:8080";

export const HTTP_BACKEND =
  process.env.NEXT_PUBLIC_HTTP_BACKEND ?? DEFAULT_HTTP_BACKEND;
  
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? DEFAULT_WS_URL;
