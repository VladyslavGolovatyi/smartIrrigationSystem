import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function MapClickHandler({ onClick }) {
    useMapEvents({
        click(e) {
            onClick([e.latlng.lat, e.latlng.lng]);
        }
    });
    return null;
}

export default function ZoneSetupModal({ zone, markerCoords, onSave, onCancel }) {
    const defaultCenter = [49.8397, 24.0297]; // Lviv
    const [name, setName] = useState(zone.name || '');
    const [info, setInfo] = useState(zone.extraInfo || '');
    const [coords, setCoords] = useState(
        markerCoords || (zone.latitude != null && zone.longitude != null
            ? [zone.latitude, zone.longitude]
            : null)
    );

    useEffect(() => {
        if (markerCoords) {
            setCoords(markerCoords);
        }
    }, [markerCoords]);

    const handleLatChange = e => {
        const lat = parseFloat(e.target.value);
        if (!isNaN(lat)) setCoords(c => [lat, c ? c[1] : null]);
    };

    const handleLngChange = e => {
        const lng = parseFloat(e.target.value);
        if (!isNaN(lng)) setCoords(c => [c ? c[0] : null, lng]);
    };

    const canSave = name.trim() && coords && !isNaN(coords[0]) && !isNaN(coords[1]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-auto mt-12 space-y-6" style={{ marginLeft: '20px' }}>
                <h2 className="text-2xl font-semibold">Configure Zone</h2>
                <p className="text-sm text-gray-700">Controller ID: <code>{zone.controllerUid}</code></p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-800 mb-1">Zone Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full border rounded p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-800 mb-1">Extra Info</label>
                        <input
                            type="text"
                            value={info}
                            onChange={e => setInfo(e.target.value)}
                            className="w-full border rounded p-2"
                        />
                    </div>
                </div>

                <div className="h-48 w-full rounded overflow-hidden">
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
                                    dragend: e => {
                                        const { lat, lng } = e.target.getLatLng();
                                        setCoords([lat, lng]);
                                    }
                                }}
                            />
                        )}
                    </MapContainer>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-800 mb-1">Latitude</label>
                        <input
                            type="number"
                            step="0.0001"
                            value={coords ? coords[0] : ''}
                            onChange={handleLatChange}
                            className="w-full border rounded p-2"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-800 mb-1">Longitude</label>
                        <input
                            type="number"
                            step="0.0001"
                            value={coords ? coords[1] : ''}
                            onChange={handleLngChange}
                            className="w-full border rounded p-2"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 border rounded"
                    >Cancel</button>
                    <button
                        onClick={() => onSave({ name: name.trim(), extraInfo: info.trim(), latitude: coords[0], longitude: coords[1] })}
                        disabled={!canSave}
                        className={`px-4 py-2 rounded ${canSave ? 'bg-blue-600 text-blue' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >Save</button>
                </div>
            </div>
        </div>
    );
}