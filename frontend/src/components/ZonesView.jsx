// `frontend/src/components/ZonesView.jsx`
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ZoneSetupModal from './ZoneSetupModal';

// fix default marker icons
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
        }
    });
    return null;
}

export default function ZonesView() {
    const [zones, setZones] = useState([]);
    const [view, setView] = useState('map');
    const [setupZone, setSetupZone] = useState(null);
    const [markerCoords, setMarkerCoords] = useState(null);

    useEffect(() => {
        axios.get('/api/zones')
            .then(res => {
                setZones(res.data);
                const missing = res.data.find(z => z.latitude == null || z.longitude == null);
                if (missing) setSetupZone(missing);
            })
            .catch(console.error);
    }, []);

    const handleSave = update => {
        axios.put(`/api/zones/${setupZone.id}`, update)
            .then(res => {
                setZones(zs => zs.map(z => z.id === res.data.id ? res.data : z));
                setSetupZone(null);
            })
            .catch(console.error);
    };

    const defaultCenter = [49.8397, 24.0297];

    return (
        <>
            <div className="p-4 space-y-4">
                <div className="flex space-x-[10px]">
                    <button
                        onClick={() => setView('list')}
                        className={`px-4 py-2 rounded ${view === 'list' ? 'bg-blue-600 text-blue' : 'bg-white text-blue-600 border border-blue-600'}`}
                    >List</button>
                    <button
                        onClick={() => setView('map')}
                        className={`px-4 py-2 rounded ${view === 'map' ? 'bg-blue-600 text-blue' : 'bg-white text-blue-600 border border-blue-600'}`}
                    >Map</button>
                </div>

                {view === 'list' && (
                    <ul className="divide-y divide-gray-200">
                        {zones.length === 0 && <li className="py-2 text-gray-500">Loading zones…</li>}
                        {zones.map(z => (
                            <li key={z.id} className="py-4">
                                <div className="font-medium text-lg">{z.name}</div>
                                <div className="text-sm text-gray-600">UID: {z.controllerUid}</div>
                                <div className="text-sm text-gray-600">Info: {z.extraInfo}</div>
                                <div className="text-sm text-gray-500">{`${z.latitude?.toFixed(4)}, ${z.longitude?.toFixed(4)}`}</div>
                            </li>
                        ))}
                    </ul>
                )}

                {view === 'map' && (
                    <div style={{ height: '500px' }} className="rounded overflow-hidden shadow bg-white">
                        <MapContainer
                            center={zones.length && zones[0].latitude != null
                                ? [zones[0].latitude, zones[0].longitude]
                                : defaultCenter}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution="© OpenStreetMap contributors"
                            />
                            <MapClickHandler onClick={setMarkerCoords} />
                            {markerCoords && (
                                <Marker position={markerCoords}>
                                    <Popup>
                                        <strong>Marker</strong><br />
                                        {markerCoords[0].toFixed(4)}, {markerCoords[1].toFixed(4)}
                                    </Popup>
                                </Marker>
                            )}
                            {zones.map(z => z.latitude != null && z.longitude != null && (
                                <Marker key={z.id} position={[z.latitude, z.longitude]}>
                                    <Popup>
                                        <strong>{z.name}</strong><br />
                                        {z.latitude.toFixed(4)}, {z.longitude.toFixed(4)}
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
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