// frontend/src/components/ZoneSetupModal.jsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

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

function MapClickHandler({ onClick }) {
    useMapEvents({
        click(e) {
            onClick([e.latlng.lat, e.latlng.lng]);
        },
    });
    return null;
}

export default function ZoneSetupModal({ zone, markerCoords, onSave, onCancel }) {
    const defaultCenter = [49.8397, 24.0297]; // Lviv
    const [name, setName] = useState(zone.name || '');
    const [info, setInfo] = useState(zone.extraInfo || '');
    const [coords, setCoords] = useState(
        markerCoords ||
        (zone.latitude != null && zone.longitude != null
            ? [zone.latitude, zone.longitude]
            : null)
    );

    useEffect(() => {
        if (markerCoords) {
            setCoords(markerCoords);
        }
    }, [markerCoords]);

    const handleLatChange = (e) => {
        const lat = parseFloat(e.target.value);
        if (!isNaN(lat)) setCoords((c) => [lat, c ? c[1] : null]);
    };

    const handleLngChange = (e) => {
        const lng = parseFloat(e.target.value);
        if (!isNaN(lng)) setCoords((c) => [c ? c[0] : null, lng]);
    };

    const canSave = name.trim() && coords && !isNaN(coords[0]) && !isNaN(coords[1]);

    return (
        <div className="modal d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header border-bottom">
                        <h5 className="modal-title">Configure Zone</h5>
                        <button type="button" className="btn-close" onClick={onCancel} aria-label="Close" />
                    </div>
                    <div className="modal-body">
                        <p className="text-muted mb-4">
                            <strong>Controller ID:</strong>{' '}
                            <span className="text-primary">{zone.controllerUid}</span>
                        </p>

                        {/* Zone Name */}
                        <div className="mb-3">
                            <label htmlFor="zoneNameInput" className="form-label">
                                Zone Name
                            </label>
                            <input
                                id="zoneNameInput"
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        {/* Extra Info */}
                        <div className="mb-3">
                            <label htmlFor="zoneInfoInput" className="form-label">
                                Extra Info
                            </label>
                            <input
                                id="zoneInfoInput"
                                type="text"
                                className="form-control"
                                value={info}
                                onChange={(e) => setInfo(e.target.value)}
                            />
                        </div>

                        <hr />

                        {/* Map */}
                        <div className="mb-3">
                            <label className="form-label">Select Location on Map</label>
                            <div className="border rounded" style={{ height: '300px' }}>
                                <MapContainer
                                    center={coords || defaultCenter}
                                    zoom={13}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution="© OpenStreetMap contributors"
                                    />
                                    <MapClickHandler onClick={setCoords} />
                                    {coords && (
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
                                    )}
                                </MapContainer>
                            </div>
                        </div>

                        {/* Latitude & Longitude Inputs */}
                        <div className="row g-3 mb-3">
                            <div className="col-md-6">
                                <label htmlFor="latitudeInput" className="form-label">
                                    Latitude
                                </label>
                                <input
                                    id="latitudeInput"
                                    type="number"
                                    step="0.0001"
                                    className="form-control"
                                    value={coords ? coords[0] : ''}
                                    onChange={handleLatChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label htmlFor="longitudeInput" className="form-label">
                                    Longitude
                                </label>
                                <input
                                    id="longitudeInput"
                                    type="number"
                                    step="0.0001"
                                    className="form-control"
                                    value={coords ? coords[1] : ''}
                                    onChange={handleLngChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer border-top justify-content-end">
                        <button type="button" className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-primary"
                            disabled={!canSave}
                            onClick={() =>
                                onSave({
                                    name: name.trim(),
                                    extraInfo: info.trim(),
                                    latitude: coords[0],
                                    longitude: coords[1],
                                })
                            }
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
