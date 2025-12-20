import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

type WeatherState = {
    city: string;
};

const initialState: WeatherState = {
    city: 'Tel Aviv',
};

const weatherSlice = createSlice({
    name: 'weather',
    initialState,
    reducers: {
        setCity(state, action: PayloadAction<string>) {
            state.city = action.payload;
        },
    },
});

export const { setCity } = weatherSlice.actions;
export default weatherSlice.reducer;