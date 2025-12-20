const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY as string;

if (!API_KEY) {
    // это удобно видеть в dev, но ключ не палим в git
    console.warn('VITE_OPENWEATHER_API_KEY is missing. Check .env.local');
}

export type WeatherResponse = {
    name: string;
    sys: { country: string };
    weather: { id: number; main: string; description: string; icon: string }[];
    main: { temp: number; feels_like: number; humidity: number; pressure: number };
    wind: { speed: number };
};

export async function fetchCurrentWeatherByCity(city: string): Promise<WeatherResponse> {
    const url = new URL(`${BASE_URL}/weather`);
    url.searchParams.set('q', city);
    url.searchParams.set('appid', API_KEY);
    url.searchParams.set('units', 'metric');
    url.searchParams.set('lang', 'en');

    const res = await fetch(url.toString());
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenWeather error ${res.status}: ${text}`);
    }
    return res.json();
}

export function iconUrl(icon: string) {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
}