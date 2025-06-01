// frontend/src/components/ZonesView.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ZoneSetupModal from './ZoneSetupModal';
import { Link } from 'react-router-dom';

// Icon URLs (hosted on GitHub) for red and green markers:
const RED_MARKER_URL =
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png';
const GREEN_MARKER_URL =
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png';

// Shadow URL (same for all markers):
const SHADOW_URL =
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

// Create L.Icon instances for red and green:
const redIcon = new L.Icon({
    iconUrl: RED_MARKER_URL,
    shadowUrl: SHADOW_URL,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
const greenIcon = new L.Icon({
    iconUrl: GREEN_MARKER_URL,
    shadowUrl: SHADOW_URL,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export default function ZonesView() {
    const [zones, setZones] = useState([]);
    const [view, setView] = useState('map');
    const [setupZone, setSetupZone] = useState(null);
    const [filter, setFilter] = useState('');

    // Fetch all zones on mount
    useEffect(() => {
        axios
            .get('/api/zones')
            .then((res) => {
                setZones(res.data);
                // If any zone is missing lat/lng, open the setup modal
                const missing = res.data.find((z) => z.latitude == null || z.longitude == null);
                if (missing) {
                    setSetupZone(missing);
                }
            })
            .catch(console.error);
    }, []);

    // Save updated coordinates (or name/info) for a zone
    const handleSave = (update) => {
        axios
            .put(`/api/zones/${setupZone.id}`, update)
            .then((res) => {
                setZones((zs) => zs.map((z) => (z.id === res.data.id ? res.data : z)));
                setSetupZone(null);
            })
            .catch(console.error);
    };

    // Default map center (Lviv) if no valid zone coordinates are available
    const defaultCenter = [49.8397, 24.0297];

    // Filter zones by name (case‐insensitive)
    const filteredZones = zones.filter((z) =>
        (z.name ?? '').toLowerCase().includes(filter.trim().toLowerCase())
    );

    return (
        <>
            <div className="container py-4">
                {/* ─── Top Controls: “List” / “Map” buttons + filter input ─── */}
                <div className="d-flex align-items-center mb-3">
                    <div className="btn-group me-3" role="group" aria-label="View toggle">
                        <button
                            type="button"
                            className={`btn ${view === 'list' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setView('list')}
                        >
                            List
                        </button>
                        <button
                            type="button"
                            className={`btn ${view === 'map' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setView('map')}
                        >
                            Map
                        </button>
                    </div>
                    {view === 'list' && (
                        <input
                            type="text"
                            placeholder="Filter by name"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="form-control w-50"
                        />
                    )}
                </div>

                {/* ─── LIST VIEW as Bootstrap Scorecards ─── */}
                {view === 'list' && (
                    <div className="row gx-3 gy-3">
                        {filteredZones.length === 0 && zones.length > 0 && (
                            <div className="col-12">
                                <div className="alert alert-secondary text-center mb-0">
                                    No zones match filter.
                                </div>
                            </div>
                        )}
                        {zones.length === 0 && (
                            <div className="col-12">
                                <div className="alert alert-secondary text-center mb-0">
                                    Loading zones…
                                </div>
                            </div>
                        )}
                        {filteredZones.map((z) => (
                            <div key={z.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                <div className="card h-100">
                                    <div className="card-body d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5 className="card-title mb-0">{z.name ?? '—'}</h5>
                                            <span
                                                className={`rounded-circle ${z.hasIssues ? 'bg-danger' : 'bg-success'} flex-shrink-0`}
                                                style={{ display: 'inline-block', width: '12px', height: '12px' }}
                                            ></span>
                                        </div>
                                        <div className="mt-auto">
                                            <Link to={`/zones/${z.id}`} className="text-primary text-decoration-none">
                                                More Info
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── MAP VIEW ─── */}
                {view === 'map' && (
                    <div className="card shadow-sm">
                        <div style={{ height: '500px' }}>
                            <MapContainer
                                center={
                                    zones.length && zones[0].latitude != null
                                        ? [zones[0].latitude, zones[0].longitude]
                                        : defaultCenter
                                }
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="© OpenStreetMap contributors"
                                />

                                {/* Zone markers: green if active, red if not */}
                                {zones
                                    .filter((z) => z.latitude != null && z.longitude != null)
                                    .map((z) => (
                                        <Marker
                                            key={z.id}
                                            position={[z.latitude, z.longitude]}
                                            icon={z.hasIssues ? greenIcon : redIcon}
                                        >
                                            <Popup>
                                                <span className="fw-semibold">{z.name ?? '—'}</span>
                                                <div className="mt-2">
                                                    <Link
                                                        to={`/zones/${z.id}`}
                                                        className="btn btn-sm btn-outline-primary"
                                                    >
                                                        More Info
                                                    </Link>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                            </MapContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* ─── Zone setup modal (if a zone is missing coordinates) ─── */}
            {setupZone && (
                <ZoneSetupModal
                    zone={setupZone}
                    markerCoords={null}
                    onSave={handleSave}
                    onCancel={() => setSetupZone(null)}
                />
            )}
        </>
    );
}
