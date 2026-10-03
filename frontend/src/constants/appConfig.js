// Set VITE_USE_BACKEND=true in ".env" to use the real Spring Boot backend.
// By default the website runs on its own, with accounts saved in the browser.
export const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';
