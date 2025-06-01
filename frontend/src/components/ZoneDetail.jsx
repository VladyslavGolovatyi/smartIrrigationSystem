// frontend/src/components/ZoneDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap is loaded

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

    useEffect(() => {
        axios
            .get(`/api/zones/${id}`)
            .then((res) => setZone(res.data))
            .catch(() => navigate('/zones'));
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
            {/* Styled Back Button */}
            <div className="mb-3">
                <Link to="/zones" className="btn btn-outline-primary">
                    ← Back to Zones
                </Link>
            </div>

            {/* Zone Header Card */}
            <div className="card mb-4 shadow-sm">
                <div className="card-body">
                    <h2 className="card-title">{zone.name || 'Unnamed Zone'}</h2>
                    <p className="text-muted mb-1">
                        <strong>Controller UID:</strong> {zone.controllerUid}
                    </p>
                    {zone.extraInfo && (
                        <p className="mb-0">
                            <strong>Extra Info:</strong> {zone.extraInfo}
                        </p>
                    )}
                </div>
            </div>

            {/* Map & Details Row */}
            <div className="row mb-4">
                <div className="col-md-6 mb-3">
                    <div className="card h-100 shadow-sm">
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
                </div>
                <div className="col-md-6 mb-3">
                    <div className="card h-100 shadow-sm">
                        <div className="card-header bg-white">Zone Details</div>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item">
                                <strong>Name:</strong> {zone.name || '—'}
                            </li>
                            <li className="list-group-item">
                                <strong>Controller UID:</strong> {zone.controllerUid}
                            </li>
                        </ul>
                        <div className="card-footer bg-white">
                            <div className="d-flex gap-2">
                                <Link to={`/zones/${id}/edit`} className="btn btn-success flex-fill">
                                    Edit Zone
                                </Link>
                                <button onClick={handleDelete} className="btn btn-danger flex-fill">
                                    Delete Zone
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subzones Section (no add button) */}
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
                                    <th scope="col">Name</th>
                                    <th scope="col">Plant</th>
                                    <th scope="col">Soil</th>
                                    <th scope="col" className="text-end">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {zone.subZones.map((sz) => (
                                    <tr key={sz.id}>
                                        <td>{sz.subzoneIndex}</td>
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
