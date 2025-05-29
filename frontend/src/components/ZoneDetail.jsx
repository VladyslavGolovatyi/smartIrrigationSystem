// frontend/src/components/ZoneDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function ZoneDetail() {
    const { id } = useParams();
    const nav     = useNavigate();
    const [zone, setZone] = useState(null);

    useEffect(() => {
        axios.get(`/api/zones/${id}`)
            .then(res => setZone(res.data))
            .catch(() => nav('/zones'));
    }, [id, nav]);

    if (!zone) return <div>Loading…</div>;

    const handleDelete = () => {
        if (!window.confirm('Delete this zone?')) return;
        axios.delete(`/api/zones/${id}`)
            .then(() => nav('/zones'))
            .catch(console.error);
    };

    const handleEdit = updatedFields => {
        axios.put(`/api/zones/${id}`, { ...zone, ...updatedFields })
            .then(res => setZone(res.data))
            .catch(console.error);
    };

    return (
        <div className="p-6 max-w-xl mx-auto space-y-6">
            {/* styled back link */}
            <Link
                to="/zones"
                className="inline-block text-blue-600 hover:text-blue-800 font-semibold mb-4"
            >
                ← Back to Zones
            </Link>

            <h1 className="text-2xl font-bold">{zone.name || 'Unnamed Zone'}</h1>
            <div><strong>Controller UID:</strong> {zone.controllerUid}</div>
            <div><strong>Latitude:</strong>  {zone.latitude}</div>
            <div><strong>Longitude:</strong> {zone.longitude}</div>
            <div><strong>Info:</strong>       {zone.extraInfo}</div>

            <div>
                <h2 className="text-xl font-semibold">Subzones</h2>
                <ul className="list-disc pl-6">
                    {zone.subZones.length === 0 ? (
                        <li className="text-gray-500">No subzones yet</li>
                    ) : (
                        zone.subZones.map(sz => (
                            <li key={sz.id} className="py-2 flex justify-between items-center">
                                <div>
                                    <div><strong>Index:</strong> {sz.subzoneIndex}</div>
                                    <div><strong>Name:</strong>  {sz.name || '—'}</div>
                                    <div><strong>Plant:</strong> {sz.plantType?.name || '—'}</div>
                                    <div><strong>Soil:</strong>  {sz.soilType?.name || '—'}</div>
                                </div>
                                {/* Details button with blue text */}
                                <Link to={`/zones/${zone.id}/subzones/${sz.id}`}>
                                    <button className="px-3 py-1 bg-blue-600 text-blue-600 rounded hover:bg-blue-700">
                                        Details
                                    </button>
                                </Link>
                            </li>
                        ))
                    )}
                </ul>
            </div>

            <div className="space-x-4">
                <button
                    onClick={() => handleEdit({ /* open a small inline form or modal here */ })}
                    className="px-4 py-2 bg-green-600 text-blue-600 rounded hover:bg-green-700"
                >
                    Edit Zone
                </button>
                <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-blue-600 rounded hover:bg-red-700"
                >
                    Delete Zone
                </button>
            </div>
        </div>
    );
}
