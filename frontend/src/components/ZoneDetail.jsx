// src/components/ZoneDetail.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Fix Leaflet’s default icon paths so the marker shows properly
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
        'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function ZoneDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [zone, setZone] = useState(null);
    const [forecast, setForecast] = useState(null);

    useEffect(() => {
        // Fetch the Zone itself
        axios
            .get(`/api/zones/${id}`)
            .then((res) => {
                setZone(res.data);
            })
            .catch(() => {
                navigate('/zones');
            });

        // Fetch the latest weather forecast for this zone
        axios
            .get(`/api/zones/${id}/weather-forecasts/latest`)
            .then((res) => {
                setForecast(res.data);
            })
            .catch(() => {
                setForecast(null);
            });
    }, [id, navigate]);

    if (!zone) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading…</span>
                </div>
            </div>
        );
    }

    const handleDelete = () => {
        if (!window.confirm('Are you sure you want to delete this zone?')) return;
        axios
            .delete(`/api/zones/${id}`)
            .then(() => navigate('/zones'))
            .catch(console.error);
    };

    return (
        <div className="container my-5">
            {/* ← Back to Zones */}
            <div className="mb-3">
                <Link to="/zones" className="btn btn-outline-primary">
                    ← Back to Zones
                </Link>
            </div>

            {/* Zone Header */}
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    <h2 className="card-title">{zone.name || 'Unnamed Zone'}</h2>
                    <p className="text-muted mb-1">
                        <strong>Controller UID:</strong> {zone.controllerUid}
                    </p>
                    {zone.extraInfo && (
                        <p className="mb-1">
                            <strong>Extra Info:</strong> {zone.extraInfo}
                        </p>
                    )}
                    {/* Edit/Delete Buttons & Forecast */}
                    <div className="d-flex align-items-center mt-3 gap-2">
                        <Link to={`/zones/${id}/edit`} className="btn btn-success">
                            Edit Zone
                        </Link>
                        <button onClick={handleDelete} className="btn btn-danger">
                            Delete Zone
                        </button>
                        <small className="text-muted ms-auto">
                            <strong>Precipitation (next hour, mm):</strong>{' '}
                            {forecast ? forecast.precipitationMm.toFixed(1) : '—'}
                        </small>
                    </div>
                </div>
            </div>

            {/* Map Section */}
            <div className="card mb-4 shadow-sm">
                <div className="card-header bg-white">Location</div>
                <div className="card-body p-0">
                    {zone.latitude != null && zone.longitude != null ? (
                        <MapContainer
                            center={[zone.latitude, zone.longitude]}
                            zoom={14}
                            scrollWheelZoom={false}
                            style={{ height: '300px', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="© OpenStreetMap contributors"
                            />
                            <Marker position={[zone.latitude, zone.longitude]} />
                        </MapContainer>
                    ) : (
                        <div className="text-center p-5 text-danger">
                            Coordinates not provided
                        </div>
                    )}
                </div>
            </div>

            {/* Subzones Section */}
            <div className="card shadow-sm">
                <div className="card-header bg-white">
                    <h5 className="mb-0">Subzones</h5>
                </div>
                <div className="card-body">
                    {zone.subZones.length === 0 ? (
                        <div className="text-center text-muted py-4">No subzones yet</div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead>
                                <tr>
                                    <th scope="col">Index</th>
                                    <th scope="col">Status</th>
                                    <th scope="col">Name</th>
                                    <th scope="col">Plant</th>
                                    <th scope="col">Soil</th>
                                    <th scope="col" className="text-end">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody>
                                {zone.subZones.map((sz) => (
                                    <tr key={sz.id}>
                                        <td>{sz.subzoneIndex}</td>
                                        {/* Status indicator dot */}
                                        <td>
                        <span
                            style={{
                                display: 'inline-block',
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: sz.hasIrrigationIssue ? 'red' : 'green',
                                marginRight: '8px',
                            }}
                        ></span>
                                        </td>
                                        <td>{sz.name || '—'}</td>
                                        <td>{sz.plantType?.name || '—'}</td>
                                        <td>{sz.soilType?.name || '—'}</td>
                                        <td className="text-end">
                                            <Link
                                                to={`/zones/${zone.id}/subzones/${sz.id}`}
                                                className="btn btn-outline-primary btn-sm me-2"
                                            >
                                                Details
                                            </Link>
                                            <Link
                                                to={`/zones/${zone.id}/subzones/${sz.id}/edit`}
                                                className="btn btn-outline-success btn-sm"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
