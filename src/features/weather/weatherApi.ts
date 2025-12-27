const BASE_URL = "https://api.openweathermap.org";

function getApiKey() {
    const key = import.meta.env.VITE_OPENWEATHER_API_KEY as string | undefined;
    if (!key) throw new Error("Missing VITE_OPENWEATHER_API_KEY in .env.local");
    return key;
}

export type CurrentWeatherDto = any;   // (можно типизировать позже красиво)
export type ForecastDto = any;

export async function fetchCurrentByCity(city: string) {
    const url = new URL("/data/2.5/weather", BASE_URL);
    url.searchParams.set("q", city);
    url.searchParams.set("appid", getApiKey());
    url.searchParams.set("units", "metric");
    url.searchParams.set("lang", "en");

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Current weather error: ${res.status}`);
    return (await res.json()) as CurrentWeatherDto;
}

export async function fetchForecastByCity(city: string) {
    const url = new URL("/data/2.5/forecast", BASE_URL);
    url.searchParams.set("q", city);
    url.searchParams.set("appid", getApiKey());
    url.searchParams.set("units", "metric");
    url.searchParams.set("lang", "en");

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Forecast error: ${res.status}`);
    return (await res.json()) as ForecastDto;
}

export async function fetchCurrentByCoords(lat: number, lon: number) {
    const url = new URL("/data/2.5/weather", BASE_URL);
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));
    url.searchParams.set("appid", getApiKey());
    url.searchParams.set("units", "metric");
    url.searchParams.set("lang", "en");

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Current weather error: ${res.status}`);
    return (await res.json()) as CurrentWeatherDto;
}

export async function fetchForecastByCoords(lat: number, lon: number) {
    const url = new URL("/data/2.5/forecast", BASE_URL);
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lon));
    url.searchParams.set("appid", getApiKey());
    url.searchParams.set("units", "metric");
    url.searchParams.set("lang", "en");

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Forecast error: ${res.status}`);
    return (await res.json()) as ForecastDto;
}