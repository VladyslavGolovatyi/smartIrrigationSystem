// frontend/src/components/SubzoneDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function SubzoneDetail() {
    const { zoneId, subzoneId } = useParams();
    const nav = useNavigate();

    const [readings, setReadings] = useState([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        // adjust endpoint to match your backend
        axios.get(`/api/zones/${zoneId}/subzones/${subzoneId}/soil-readings`)
            .then(res => {
                // expect an array of { recordedAt: ISOstring, moisturePercent: number }
                const data = res.data.map(r => ({
                    time: new Date(r.recordedAt).toLocaleTimeString(),
                    value: r.soilMoisturePercent
                }));
                setReadings(data);
            })
            .catch(() => {
                // if error (e.g. bad id), go back
                nav(`/zones/${zoneId}`);
            })
            .finally(() => setLoading(false));
    }, [zoneId, subzoneId, nav]);

    if (loading) return <div>Loading chart…</div>;
    if (!readings.length) return (
        <div className="p-6 max-w-xl mx-auto">
            <Link to={`/zones/${zoneId}`} className="text-blue-600 hover:underline">← Back to Zone</Link>
            <p className="mt-4 text-gray-500">No moisture readings yet for this subzone.</p>
        </div>
    );

    return (
        <div className="p-6 max-w-xl mx-auto space-y-6">
            <Link to={`/zones/${zoneId}`} className="text-blue-600 hover:underline">← Back to Zone</Link>
            <h1 className="text-2xl font-bold">Soil Moisture History</h1>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={readings} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={[0, 100]} unit="%" />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
