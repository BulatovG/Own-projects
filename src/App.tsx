import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from './app/store';
import { setCity } from './features/weather/weatherSlice';

export default function App() {
    const dispatch = useDispatch();
    const city = useSelector((state: RootState) => state.weather.city);

    return (
        <div className="container py-5">
            <div className="card shadow-sm">
                <div className="card-body">
                    <h1 className="h4 mb-3">Weather App</h1>

                    <input
                        className="form-control mb-3"
                        value={city}
                        onChange={(e) => dispatch(setCity(e.target.value))}
                        placeholder="Enter city"
                    />

                    <div className="text-muted">
                        Current city in Redux: <b>{city}</b>
                    </div>
                </div>
            </div>
        </div>
    );
}