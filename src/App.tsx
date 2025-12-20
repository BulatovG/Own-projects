import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import {
    addSavedCity,
    fetchWeatherByCity,
    fetchWeatherByLocation,
    removeSavedCity,
    setCity,
} from "./features/weather/weatherSlice";

export default function App() {
    const dispatch = useAppDispatch();
    const { city, current, forecast, status, error, savedCities } = useAppSelector((s) => s.weather);

    const [input, setInput] = useState(city);

    useEffect(() => {
        dispatch(fetchWeatherByCity(city));
    }, [dispatch, city]);

    const onSearch = () => {
        const trimmed = input.trim();
        if (trimmed.length < 2) return;
        dispatch(setCity(trimmed));
        dispatch(addSavedCity(trimmed));
        dispatch(fetchWeatherByCity(trimmed));
    };

    const onUseLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported in this browser.");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                dispatch(
                    fetchWeatherByLocation({
                        lat: pos.coords.latitude,
                        lon: pos.coords.longitude,
                    })
                );
            },
            (err) => {
                alert(`Location error: ${err.message}`);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    return (
        <div className="container py-4">
            <div className="row g-4">
                {/* Left: Saved Cities */}
                <div className="col-12 col-lg-4">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between">
                                <h2 className="h5 mb-0">Saved cities</h2>
                                <button className="btn btn-outline-secondary btn-sm" onClick={onUseLocation}>
                                    Use my location
                                </button>
                            </div>

                            <div className="input-group mt-3">
                                <input
                                    className="form-control"
                                    placeholder="Search city (e.g., Jerusalem)"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && onSearch()}
                                />
                                <button className="btn btn-primary" onClick={onSearch}>
                                    Search
                                </button>
                            </div>

                            <div className="list-group mt-3">
                                {savedCities.map((c) => (
                                    <div
                                        key={c}
                                        className={`list-group-item list-group-item-action d-flex align-items-center justify-content-between ${
                                            c.toLowerCase() === city.toLowerCase() ? "active" : ""
                                        }`}
                                        role="button"
                                        onClick={() => {
                                            dispatch(setCity(c));
                                            dispatch(fetchWeatherByCity(c));
                                        }}
                                    >
                                        <span>{c}</span>
                                        <button
                                            className={`btn btn-sm ${c.toLowerCase() === city.toLowerCase() ? "btn-light" : "btn-outline-danger"}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                dispatch(removeSavedCity(c));
                                            }}
                                            title="Remove"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 text-muted small">
                                OpenWeather • Redux Toolkit • Vite • Bootstrap
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Weather */}
                <div className="col-12 col-lg-8">
                    <h1 className="mb-3">Weather</h1>

                    {status === "loading" && (
                        <div className="alert alert-info d-flex align-items-center gap-2">
                            <div className="spinner-border spinner-border-sm" role="status" />
                            Loading...
                        </div>
                    )}

                    {error && <div className="alert alert-danger">Error: {error}</div>}

                    {current && status === "succeeded" && (
                        <>
                            {/* Current */}
                            <div className="card shadow-sm mb-3">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                                        <div>
                                            <h2 className="h4 mb-1">{current.name}</h2>
                                            <div className="text-muted text-capitalize">{current.description}</div>
                                        </div>

                                        <div className="d-flex align-items-center gap-3">
                                            <img
                                                alt={current.description}
                                                width={72}
                                                height={72}
                                                src={`https://openweathermap.org/img/wn/${current.icon}@2x.png`}
                                            />
                                            <div className="text-end">
                                                <div className="display-6 fw-semibold">{current.temp}°C</div>
                                                <div className="text-muted">Feels like {current.feelsLike}°C</div>
                                            </div>
                                        </div>
                                    </div>

                                    <hr />

                                    <div className="row">
                                        <div className="col-sm-6">
                                            <div className="text-muted">Humidity</div>
                                            <div className="fw-semibold">{current.humidity}%</div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="text-muted">Wind</div>
                                            <div className="fw-semibold">{current.windSpeed} m/s</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Forecast */}
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <h3 className="h5 mb-0">5-day forecast</h3>
                                        <span className="text-muted small">Daily min/max</span>
                                    </div>

                                    <div className="row g-3 mt-1">
                                        {forecast.map((d) => (
                                            <div className="col-12 col-md-6 col-xl-4" key={d.date}>
                                                <div className="border rounded-3 p-3 h-100">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <div className="fw-semibold">{d.weekday}</div>
                                                            <div className="text-muted small">{d.date}</div>
                                                        </div>
                                                        <img
                                                            alt={d.description}
                                                            width={48}
                                                            height={48}
                                                            src={`https://openweathermap.org/img/wn/${d.icon}@2x.png`}
                                                        />
                                                    </div>

                                                    <div className="text-capitalize mt-2">{d.description}</div>

                                                    <div className="d-flex align-items-center justify-content-between mt-2">
                                                        <div className="text-muted">Min</div>
                                                        <div className="fw-semibold">{d.tempMin}°C</div>
                                                    </div>
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div className="text-muted">Max</div>
                                                        <div className="fw-semibold">{d.tempMax}°C</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {!forecast.length && <div className="text-muted mt-3">No forecast data</div>}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}