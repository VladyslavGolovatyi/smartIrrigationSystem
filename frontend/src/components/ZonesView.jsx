// frontend/src/components/ZonesView.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ZoneSetupModal from './ZoneSetupModal';
import { Link } from 'react-router-dom';

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

function MapClickHandler({ onClick }) {
    useMapEvents({
        click(e) {
            onClick([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
}

export default function ZonesView() {
    const [zones, setZones] = useState([]);
    const [view, setView] = useState('map');
    const [setupZone, setSetupZone] = useState(null);
    const [markerCoords, setMarkerCoords] = useState(null);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        axios
            .get('/api/zones')
            .then((res) => {
                setZones(res.data);
                const missing = res.data.find((z) => z.latitude == null || z.longitude == null);
                if (missing) setSetupZone(missing);
            })
            .catch(console.error);
    }, []);

    const handleSave = (update) => {
        axios
            .put(`/api/zones/${setupZone.id}`, update)
            .then((res) => {
                setZones((zs) => zs.map((z) => (z.id === res.data.id ? res.data : z)));
                setSetupZone(null);
            })
            .catch(console.error);
    };

    const defaultCenter = [49.8397, 24.0297];

    // Safely apply name filter (handles null or undefined names)
    const filteredZones = zones.filter((z) =>
        (z.name ?? '').toLowerCase().includes(filter.trim().toLowerCase())
    );

    return (
        <>
            <div className="container py-4">
                {/* Zone/List selector and Filter */}
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

                {/* LIST VIEW as Bootstrap scorecards */}
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
                                <div className="alert alert-secondary text-center mb-0">Loading zones…</div>
                            </div>
                        )}
                        {filteredZones.map((z) => (
                            <div key={z.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                                <div className="card h-100">
                                    <div className="card-body d-flex flex-column">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h5 className="card-title mb-0">{z.name ?? '—'}</h5>
                                            <span
                                                className={`rounded-circle ${z.isActive ? 'bg-success' : 'bg-danger'}`}
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

                {/* MAP VIEW */}
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
                                <MapClickHandler onClick={setMarkerCoords} />

                                {/* If user clicks on map, show a marker without coordinates */}
                                {markerCoords && (
                                    <Marker position={markerCoords}>
                                        <Popup>
                                            <strong>Marker</strong>
                                        </Popup>
                                    </Marker>
                                )}

                                {/* Zone markers */}
                                {zones
                                    .filter((z) => z.latitude != null && z.longitude != null)
                                    .map((z) => (
                                        <Marker key={z.id} position={[z.latitude, z.longitude]}>
                                            <Popup>
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="fw-semibold">{z.name ?? '—'}</span>
                                                    <span
                                                        className={`rounded-circle ${
                                                            z.isActive ? 'bg-success' : 'bg-danger'
                                                        }`}
                                                        style={{ display: 'inline-block', width: '12px', height: '12px' }}
                                                    ></span>
                                                </div>
                                                <Link
                                                    to={`/zones/${z.id}`}
                                                    className="btn btn-sm btn-outline-primary"
                                                >
                                                    More Info
                                                </Link>
                                            </Popup>
                                        </Marker>
                                    ))}
                            </MapContainer>
                        </div>
                    </div>
                )}
            </div>

            {setupZone && (
                <ZoneSetupModal
                    zone={setupZone}
                    markerCoords={markerCoords}
                    onSave={handleSave}
                    onCancel={() => setSetupZone(null)}
                />
            )}
        </>
    );
}
