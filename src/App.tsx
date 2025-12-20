import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { fetchWeatherByCity } from "./features/weather/weatherSlice";

export default function App() {
    const dispatch = useAppDispatch();
    const { city, data, status, error } = useAppSelector((s) => s.weather);

    const [input, setInput] = useState(city);

    useEffect(() => {
        dispatch(fetchWeatherByCity(city));
    }, [dispatch, city]);

    const onSearch = () => {
        const trimmed = input.trim();
        if (trimmed.length < 2) return;
        dispatch(fetchWeatherByCity(trimmed));
    };

    return (
        <div className="container py-4" style={{ maxWidth: 720 }}>
            <h1 className="mb-3">Weather App</h1>

            <div className="input-group mb-3">
                <input
                    className="form-control"
                    placeholder="Введите город (например: Jerusalem)"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") onSearch();
                    }}
                />
                <button className="btn btn-primary" onClick={onSearch}>
                    Найти
                </button>
            </div>

            {status === "loading" && <div className="alert alert-info">Загрузка...</div>}

            {error && <div className="alert alert-danger">Ошибка: {error}</div>}

            {data && status === "succeeded" && (
                <div className="card shadow-sm">
                    <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between">
                            <div>
                                <h2 className="h4 mb-1">{data.name}</h2>
                                <div className="text-muted">{data.description}</div>
                            </div>

                            <div className="d-flex align-items-center gap-3">
                                <img
                                    alt={data.description}
                                    width={64}
                                    height={64}
                                    src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
                                />
                                <div className="text-end">
                                    <div className="fs-2 fw-semibold">{data.temp}°C</div>
                                    <div className="text-muted">ощущается {data.feelsLike}°C</div>
                                </div>
                            </div>
                        </div>

                        <hr />

                        <div className="row">
                            <div className="col-sm-6">
                                <div className="text-muted">Влажность</div>
                                <div className="fw-semibold">{data.humidity}%</div>
                            </div>
                            <div className="col-sm-6">
                                <div className="text-muted">Ветер</div>
                                <div className="fw-semibold">{data.windSpeed} м/с</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-3 text-muted small">
                API: OpenWeather • Redux Toolkit • Vite
            </div>
        </div>
    );
}