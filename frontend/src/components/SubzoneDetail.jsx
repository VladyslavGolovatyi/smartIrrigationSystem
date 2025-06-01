// src/components/SubzoneDetail.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function SubzoneDetail() {
    const { zoneId, subzoneId } = useParams();
    const navigate = useNavigate();

    const [subzone, setSubzone] = useState(null);
    const [zone, setZone] = useState(null);
    const [loading, setLoading] = useState(true);

    // Time-range state (ISO strings)
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    // Metric toggles
    const [showSoil, setShowSoil] = useState(true);
    const [showRain, setShowRain] = useState(true);
    const [showIrr, setShowIrr] = useState(true);

    useEffect(() => {
        if (!zoneId || !subzoneId) {
            navigate('/zones');
            return;
        }

        axios
            .get(`/api/zones/${zoneId}`)
            .then((res) => setZone(res.data))
            .catch(() => navigate('/zones'));

        axios
            .get(`/api/zones/${zoneId}/subzones/${subzoneId}`)
            .then((res) => {
                setSubzone(res.data);
                setLoading(false);
            })
            .catch(() => navigate(`/zones/${zoneId}`));
    }, [zoneId, subzoneId, navigate]);

    const rawSoil = useMemo(() => {
        if (!subzone) return [];
        return subzone.soilMoistureReadings.map((r) => ({
            time: new Date(r.recordedAt).getTime(),
            soil: r.moisturePercent,
        }));
    }, [subzone]);

    const rawRain = useMemo(() => {
        if (!subzone) return [];
        return subzone.rainSensorReadings.map((r) => ({
            time: new Date(r.recordedAt).getTime(),
            rain: r.raining ? 1 : 0,
        }));
    }, [subzone]);

    const rawIrr = useMemo(() => {
        if (!subzone) return [];
        return subzone.irrigationHistoryList.map((h) => ({
            time: new Date(h.startTime).getTime(),
            triggeredBy: h.triggeredBy,
        }));
    }, [subzone]);

    useMemo(() => {
        rawSoil.sort((a, b) => a.time - b.time);
        rawRain.sort((a, b) => a.time - b.time);
        rawIrr.sort((a, b) => a.time - b.time);
    }, [rawSoil, rawRain, rawIrr]);

    const mergedTimestamps = useMemo(() => {
        const setT = new Set();
        rawSoil.forEach((pt) => setT.add(pt.time));
        rawRain.forEach((pt) => setT.add(pt.time));
        return Array.from(setT).sort((a, b) => a - b);
    }, [rawSoil, rawRain]);

    const chartData = useMemo(() => {
        const startMs = startTime ? new Date(startTime).getTime() : -Infinity;
        const endMs = endTime ? new Date(endTime).getTime() : Infinity;

        return mergedTimestamps
            .filter((t) => t >= startMs && t <= endMs)
            .map((t) => {
                const soilPoint = rawSoil.find((pt) => pt.time === t);
                const rainPoint = rawRain.find((pt) => pt.time === t);
                return {
                    time: t,
                    soil: soilPoint ? soilPoint.soil : null,
                    rain: rainPoint ? rainPoint.rain : null,
                };
            });
    }, [mergedTimestamps, rawSoil, rawRain, startTime, endTime]);

    const filteredIrr = useMemo(() => {
        const startMs = startTime ? new Date(startTime).getTime() : -Infinity;
        const endMs = endTime ? new Date(endTime).getTime() : Infinity;
        return rawIrr.filter((pt) => pt.time >= startMs && pt.time <= endMs);
    }, [rawIrr, startTime, endTime]);

    const applyPreset = (preset) => {
        const now = new Date();
        let start, end;
        end = now.toISOString().slice(0, 16);
        if (preset === '24h') {
            start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 16);
        } else if (preset === '7d') {
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 16);
        } else if (preset === '1m') {
            start = new Date(now.setMonth(now.getMonth() - 1))
                .toISOString()
                .slice(0, 16);
        } else {
            start = '';
            end = '';
        }
        setStartTime(start);
        setEndTime(end);
    };

    const handleManualIrrigation = () => {
        if (!window.confirm('Trigger manual irrigation?')) return;
        axios
            .post(`/api/zones/${zoneId}/subzones/${subzoneId}/irrigations`, {
                triggeredBy: 'manual',
            })
            .then(() => axios.get(`/api/zones/${zoneId}/subzones/${subzoneId}`))
            .then((res) => setSubzone(res.data))
            .catch(console.error);
    };

    if (loading || !subzone) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading…</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container my-5">
            {/* Back Button */}
            <div className="mb-3">
                <Link to={`/zones/${zoneId}`} className="btn btn-outline-primary">
                    ← Back to Zone
                </Link>
            </div>

            {/* Header Card */}
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    <h2 className="card-title">
                        Subzone {subzone.subzoneIndex}: {subzone.name || 'Unnamed'}
                    </h2>
                    <p className="text-muted mb-1">
                        <strong>Plant:</strong> {subzone.plantType?.name || '—'}
                    </p>
                    <p className="text-muted mb-1">
                        <strong>Soil Type:</strong> {subzone.soilType?.name || '—'}
                    </p>
                    {subzone.extraInfo && (
                        <p className="mb-0">
                            <strong>Extra Info:</strong> {subzone.extraInfo}
                        </p>
                    )}
                </div>
            </div>

            {/* Time Filter, Presets & Toggles */}
            <div className="card mb-4 shadow-sm">
                <div className="card-header bg-white">Data Controls</div>
                <div className="card-body">
                    <div className="row g-3">
                        {/* Preset buttons */}
                        <div className="col-12 mb-2">
                            <button
                                className="btn btn-outline-secondary me-2"
                                onClick={() => applyPreset('24h')}
                            >
                                Last 24h
                            </button>
                            <button
                                className="btn btn-outline-secondary me-2"
                                onClick={() => applyPreset('7d')}
                            >
                                Last 7d
                            </button>
                            <button
                                className="btn btn-outline-secondary me-2"
                                onClick={() => applyPreset('1m')}
                            >
                                Last Month
                            </button>
                            <button
                                className="btn btn-outline-secondary"
                                onClick={() => applyPreset('')}
                            >
                                Clear
                            </button>
                        </div>

                        <div className="col-md-6">
                            <label htmlFor="startTime" className="form-label">
                                Start Time
                            </label>
                            <input
                                type="datetime-local"
                                id="startTime"
                                className="form-control"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label htmlFor="endTime" className="form-label">
                                End Time
                            </label>
                            <input
                                type="datetime-local"
                                id="endTime"
                                className="form-control"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>

                        <div className="col-12">
                            <label className="form-label">Metrics to Display:</label>

                            {/* Vertical list of checkboxes */}
                            <div className="form-check">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="toggleSoil"
                                    checked={showSoil}
                                    onChange={() => setShowSoil((prev) => !prev)}
                                />
                                <label className="form-check-label" htmlFor="toggleSoil">
                                    Soil Moisture
                                </label>
                            </div>
                            <div className="form-check mt-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="toggleRain"
                                    checked={showRain}
                                    onChange={() => setShowRain((prev) => !prev)}
                                />
                                <label className="form-check-label" htmlFor="toggleRain">
                                    Rain (0/1)
                                </label>
                            </div>
                            <div className="form-check mt-2">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="toggleIrr"
                                    checked={showIrr}
                                    onChange={() => setShowIrr((prev) => !prev)}
                                />
                                <label className="form-check-label" htmlFor="toggleIrr">
                                    Irrigation Events
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chart Card */}
            <div className="card mb-4 shadow-sm">
                <div className="card-header bg-white">Time Series Data</div>
                <div className="card-body">
                    <ResponsiveContainer width="100%" height={350}>
                        <LineChart
                            data={chartData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis
                                dataKey="time"
                                type="number"
                                domain={['dataMin', 'dataMax']}
                                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                            />
                            <YAxis
                                yAxisId="left"
                                domain={[0, 100]}
                                unit="%"
                                axisLine={{ stroke: '#8884d8' }}
                                tickLine={{ stroke: '#8884d8' }}
                                label={{ value: 'Soil (%)', angle: -90, position: 'insideLeft' }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                domain={[0, 1]}
                                tickCount={2}
                                axisLine={{ stroke: '#82ca9d' }}
                                tickLine={{ stroke: '#82ca9d' }}
                                label={{ value: 'Rain (0/1)', angle: 90, position: 'insideRight' }}
                            />

                            <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />

                            {showSoil && (
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="soil"
                                    stroke="rgba(75, 192, 192, 1)"
                                    dot={false}
                                    name="Soil Moisture (%)"
                                />
                            )}

                            {showRain && (
                                <Line
                                    yAxisId="right"
                                    type="stepAfter"
                                    dataKey="rain"
                                    stroke="rgba(54, 162, 235, 1)"
                                    strokeWidth={2}
                                    dot={false}
                                    name="Rain (0/1)"
                                />
                            )}

                            {showIrr &&
                                filteredIrr.map((pt) => (
                                    <ReferenceLine
                                        key={pt.time}
                                        x={pt.time}
                                        stroke={
                                            pt.triggeredBy === 'manual'
                                                ? 'rgba(40, 167, 69, 0.9)'
                                                : 'rgba(255, 99, 132, 0.8)'
                                        }
                                        strokeDasharray={pt.triggeredBy === 'manual' ? '' : '3 3'}
                                        yAxisId="left"
                                        label={{
                                            position: 'top',
                                            value: pt.triggeredBy === 'manual' ? 'Manual' : 'Auto',
                                            fill: pt.triggeredBy === 'manual' ? '#28a745' : '#ff6384',
                                        }}
                                    />
                                ))}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Manual Irrigation Button */}
            <div className="mb-4">
                <button className="btn btn-warning" onClick={handleManualIrrigation}>
                    Manual Irrigation
                </button>
            </div>
        </div>
    );
}
