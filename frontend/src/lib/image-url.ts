const API = import.meta.env.VITE_API_URL ?? "";


export const imageUrl = (src: string) =>
  src.startsWith("/api/") ? `${API}${src}` : src;