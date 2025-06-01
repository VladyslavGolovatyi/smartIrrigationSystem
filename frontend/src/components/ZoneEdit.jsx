// frontend/src/components/ZoneEdit.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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

// Component to handle map clicks and update marker position
function MapClickHandler({ onClick }) {
    useMapEvents({
        click(e) {
            onClick([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
}

export default function ZoneEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [zone, setZone] = useState(null);
    const [name, setName] = useState('');
    const [extraInfo, setExtraInfo] = useState('');
    const [coords, setCoords] = useState([49.8397, 24.0297]); // default Lviv center
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios
            .get(`/api/zones/${id}`)
            .then((res) => {
                const data = res.data;
                setZone(data);
                setName(data.name || '');
                setExtraInfo(data.extraInfo || '');
                if (data.latitude != null && data.longitude != null) {
                    setCoords([data.latitude, data.longitude]);
                }
            })
            .catch(() => navigate('/zones'))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const updated = {
            name: name.trim(),
            extraInfo: extraInfo.trim(),
            latitude: coords[0],
            longitude: coords[1],
        };
        axios
            .put(`/api/zones/${id}`, updated)
            .then((res) => {
                navigate(`/zones/${id}`);
            })
            .catch((err) => {
                console.error(err);
                alert('Failed to save changes. Please try again.');
            });
    };

    if (loading) {
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
            {/* Back to Zone Detail */}
            <div className="mb-3">
                <Link to={`/zones/${id}`} className="btn btn-outline-secondary">
                    ← Cancel
                </Link>
            </div>

            <div className="card shadow-sm">
                <div className="card-header bg-white">
                    <h3 className="mb-0">Edit Zone</h3>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        {/* Name Field */}
                        <div className="mb-3">
                            <label htmlFor="zoneName" className="form-label">
                                Zone Name
                            </label>
                            <input
                                type="text"
                                id="zoneName"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Extra Info Field */}
                        <div className="mb-3">
                            <label htmlFor="zoneExtraInfo" className="form-label">
                                Extra Info
                            </label>
                            <textarea
                                id="zoneExtraInfo"
                                className="form-control"
                                rows="3"
                                value={extraInfo}
                                onChange={(e) => setExtraInfo(e.target.value)}
                            />
                        </div>

                        {/* Location Map */}
                        <div className="mb-3">
                            <label className="form-label">Location (click on map to set marker)</label>
                            <div className="border rounded" style={{ height: '300px' }}>
                                <MapContainer
                                    center={coords}
                                    zoom={14}
                                    scrollWheelZoom={false}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution="© OpenStreetMap contributors"
                                    />
                                    <MapClickHandler onClick={setCoords} />
                                    <Marker
                                        position={coords}
                                        draggable
                                        eventHandlers={{
                                            dragend: (e) => {
                                                const { lat, lng } = e.target.getLatLng();
                                                setCoords([lat, lng]);
                                            },
                                        }}
                                    />
                                </MapContainer>
                            </div>
                        </div>

                        {/* Coordinates Display */}
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <label htmlFor="latitude" className="form-label">
                                    Latitude
                                </label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    id="latitude"
                                    className="form-control"
                                    value={coords[0]}
                                    onChange={(e) => {
                                        const lat = parseFloat(e.target.value);
                                        if (!isNaN(lat)) setCoords([lat, coords[1]]);
                                    }}
                                    required
                                />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="longitude" className="form-label">
                                    Longitude
                                </label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    id="longitude"
                                    className="form-control"
                                    value={coords[1]}
                                    onChange={(e) => {
                                        const lng = parseFloat(e.target.value);
                                        if (!isNaN(lng)) setCoords([coords[0], lng]);
                                    }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="d-flex justify-content-end">
                            <button type="submit" className="btn btn-primary">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
