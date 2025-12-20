export const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string;

if (!OPENWEATHER_API_KEY) {
    // eslint-disable-next-line no-console
    console.warn("VITE_OPENWEATHER_API_KEY is missing. Check your .env.local");
}