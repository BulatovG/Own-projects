import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { http } from "../../shared/http";
import { OPENWEATHER_API_KEY } from "../../shared/env";
import type { WeatherData } from "./types";

type WeatherState = {
    city: string;
    data: WeatherData | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
};

const initialState: WeatherState = {
    city: "Tel Aviv",
    data: null,
    status: "idle",
    error: null,
};

// thunk: загрузить погоду по названию города
export const fetchWeatherByCity = createAsyncThunk<
    WeatherData,
    string,
    { rejectValue: string }
>("weather/fetchByCity", async (city, thunkApi) => {
    try {
        const res = await http.get("/weather", {
            params: {
                q: city,
                appid: OPENWEATHER_API_KEY,
                units: "metric",
                lang: "ru",
            },
        });

        const w = res.data;

        const mapped: WeatherData = {
            name: w.name,
            temp: Math.round(w.main.temp),
            feelsLike: Math.round(w.main.feels_like),
            description: w.weather?.[0]?.description ?? "",
            icon: w.weather?.[0]?.icon ?? "01d",
            humidity: w.main.humidity,
            windSpeed: w.wind.speed,
        };

        return mapped;
    } catch (e: any) {
        const msg =
            e?.response?.data?.message
                ? String(e.response.data.message)
                : "Failed to load weather";
        return thunkApi.rejectWithValue(msg);
    }
});

const weatherSlice = createSlice({
    name: "weather",
    initialState,
    reducers: {
        setCity(state, action: PayloadAction<string>) {
            state.city = action.payload;
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers(builder) {
        builder
            .addCase(fetchWeatherByCity.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchWeatherByCity.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.data = action.payload;
            })
            .addCase(fetchWeatherByCity.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Unknown error";
            });
    },
});

export const { setCity, clearError } = weatherSlice.actions;
export default weatherSlice.reducer;