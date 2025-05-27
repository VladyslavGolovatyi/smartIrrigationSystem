import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ZonesList() {
    const [zones, setZones] = useState([]);

    useEffect(() => {
        axios.get('/api/zones')
            .then(res => setZones(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div>
            <h1>Zones</h1>
            {zones.length === 0
                ? <p>Loading..</p>
                : <ul>
                    {zones.map(z => <li key={z.id}>{z.name}</li>)}
                </ul>
            }
        </div>
    );
}
