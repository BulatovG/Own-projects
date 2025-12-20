import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
    fetchCurrentByCity,
    fetchForecastByCity,
    fetchCurrentByCoords,
    fetchForecastByCoords,
} from "./weatherApi";

type CurrentWeather = {
    name: string;
    description: string;
    icon: string;
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
};

type ForecastDay = {
    date: string;         // "2025-12-20"
    weekday: string;      // "Sat"
    icon: string;
    description: string;
    tempMin: number;
    tempMax: number;
};

type WeatherState = {
    city: string;
    savedCities: string[];

    current: CurrentWeather | null;
    forecast: ForecastDay[];

    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
};

const LS_CITY = "weather_city";
const LS_SAVED = "weather_savedCities";

function loadCity() {
    return localStorage.getItem(LS_CITY) || "Jerusalem";
}
function loadSavedCities(): string[] {
    try {
        const raw = localStorage.getItem(LS_SAVED);
        const arr = raw ? (JSON.parse(raw) as string[]) : ["Jerusalem", "Tel Aviv", "Haifa"];
        return Array.from(new Set(arr)).slice(0, 12);
    } catch {
        return ["Jerusalem", "Tel Aviv", "Haifa"];
    }
}

function mapCurrent(dto: any): CurrentWeather {
    return {
        name: dto.name,
        description: dto.weather?.[0]?.description ?? "",
        icon: dto.weather?.[0]?.icon ?? "01d",
        temp: Math.round(dto.main?.temp),
        feelsLike: Math.round(dto.main?.feels_like),
        humidity: dto.main?.humidity ?? 0,
        windSpeed: dto.wind?.speed ?? 0,
    };
}

/**
 * Превращаем 3-hour forecast (40 точек) в 5 дней.
 * Берём min/max по каждому дню, и “главную” точку ближе к 12:00.
 */
function mapForecast(dto: any): ForecastDay[] {
    const list: any[] = dto.list ?? [];
    const byDate = new Map<string, any[]>();

    for (const item of list) {
        const dt = item.dt_txt as string; // "2025-12-20 12:00:00"
        const date = dt.slice(0, 10);
        if (!byDate.has(date)) byDate.set(date, []);
        byDate.get(date)!.push(item);
    }

    const dates = Array.from(byDate.keys()).slice(0, 5);

    return dates.map((date) => {
        const items = byDate.get(date)!;

        // min/max по дню
        let min = Number.POSITIVE_INFINITY;
        let max = Number.NEGATIVE_INFINITY;
        for (const it of items) {
            const tMin = it.main?.temp_min ?? it.main?.temp ?? 0;
            const tMax = it.main?.temp_max ?? it.main?.temp ?? 0;
            min = Math.min(min, tMin);
            max = Math.max(max, tMax);
        }

        // выбираем точку ближе к 12:00
        const best = items.reduce((acc, cur) => {
            const accHour = Number((acc.dt_txt as string).slice(11, 13));
            const curHour = Number((cur.dt_txt as string).slice(11, 13));
            return Math.abs(curHour - 12) < Math.abs(accHour - 12) ? cur : acc;
        });

        const weekday = new Date(date).toLocaleDateString("en-US", { weekday: "short" });

        return {
            date,
            weekday,
            icon: best.weather?.[0]?.icon ?? "01d",
            description: best.weather?.[0]?.description ?? "",
            tempMin: Math.round(min),
            tempMax: Math.round(max),
        };
    });
}

export const fetchWeatherByCity = createAsyncThunk(
    "weather/fetchByCity",
    async (city: string) => {
        const [currentDto, forecastDto] = await Promise.all([
            fetchCurrentByCity(city),
            fetchForecastByCity(city),
        ]);
        return {
            city: currentDto.name as string,
            current: mapCurrent(currentDto),
            forecast: mapForecast(forecastDto),
        };
    }
);

export const fetchWeatherByLocation = createAsyncThunk(
    "weather/fetchByLocation",
    async ({ lat, lon }: { lat: number; lon: number }) => {
        const [currentDto, forecastDto] = await Promise.all([
            fetchCurrentByCoords(lat, lon),
            fetchForecastByCoords(lat, lon),
        ]);
        return {
            city: currentDto.name as string,
            current: mapCurrent(currentDto),
            forecast: mapForecast(forecastDto),
        };
    }
);

const initialState: WeatherState = {
    city: loadCity(),
    savedCities: loadSavedCities(),
    current: null,
    forecast: [],
    status: "idle",
    error: null,
};

const weatherSlice = createSlice({
    name: "weather",
    initialState,
    reducers: {
        setCity(state, action: PayloadAction<string>) {
            state.city = action.payload;
            localStorage.setItem(LS_CITY, state.city);
        },
        addSavedCity(state, action: PayloadAction<string>) {
            const c = action.payload.trim();
            if (!c) return;
            const next = [c, ...state.savedCities.filter((x) => x.toLowerCase() !== c.toLowerCase())];
            state.savedCities = next.slice(0, 12);
            localStorage.setItem(LS_SAVED, JSON.stringify(state.savedCities));
        },
        removeSavedCity(state, action: PayloadAction<string>) {
            state.savedCities = state.savedCities.filter((c) => c !== action.payload);
            localStorage.setItem(LS_SAVED, JSON.stringify(state.savedCities));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWeatherByCity.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchWeatherByCity.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.city = action.payload.city;
                state.current = action.payload.current;
                state.forecast = action.payload.forecast;
                localStorage.setItem(LS_CITY, state.city);
            })
            .addCase(fetchWeatherByCity.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message ?? "Unknown error";
            })
            .addCase(fetchWeatherByLocation.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchWeatherByLocation.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.city = action.payload.city;
                state.current = action.payload.current;
                state.forecast = action.payload.forecast;
                localStorage.setItem(LS_CITY, state.city);
            })
            .addCase(fetchWeatherByLocation.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.error.message ?? "Unknown error";
            });
    },
});

export const { setCity, addSavedCity, removeSavedCity } = weatherSlice.actions;
export default weatherSlice.reducer;