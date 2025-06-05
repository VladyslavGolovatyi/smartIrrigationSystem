import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function SubZoneEdit() {
    const { zoneId, subzoneId } = useParams();
    const navigate = useNavigate();

    // local state
    const [subZone, setSubZone] = useState(null);
    const [plantTypes, setPlantTypes] = useState([]);
    const [soilTypes, setSoilTypes] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        plantTypeId: '',
        soilTypeId: '',
        extraInfo: '',
        defaultIrrigationDurationInSeconds: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1) Fetch SubZone details
        axios
            .get(`/api/zones/${zoneId}/subzones/${subzoneId}`)
            .then((res) => {
                setSubZone(res.data);

                // initialize form values
                setFormData({
                    name: res.data.name || '',
                    plantTypeId: res.data.plantType ? res.data.plantType.id : '',
                    soilTypeId: res.data.soilType ? res.data.soilType.id : '',
                    extraInfo: res.data.extraInfo || '',
                    defaultIrrigationDurationInSeconds:
                        res.data.defaultIrrigationDurationInSeconds || '',
                });
            })
            .catch((err) => {
                console.error('Failed to load subzone:', err);
                navigate(`/zones/${zoneId}`); // go back if nonexistent
            });

        // 2) Fetch all PlantTypes
        axios
            .get('/api/plant-types')
            .then((res) => setPlantTypes(res.data))
            .catch(console.error);

        // 3) Fetch all SoilTypes
        axios
            .get('/api/soil-types')
            .then((res) => setSoilTypes(res.data))
            .catch(console.error);

        // After data loaded, remove spinner
        setLoading(false);
    }, [zoneId, subzoneId, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Build payload
        const payload = {
            name: formData.name,
            extraInfo: formData.extraInfo,
            defaultIrrigationDurationInSeconds: Number(
                formData.defaultIrrigationDurationInSeconds
            ),
            plantType: formData.plantTypeId
                ? { id: Number(formData.plantTypeId) }
                : null,
            soilType: formData.soilTypeId
                ? { id: Number(formData.soilTypeId) }
                : null,
        };

        axios
            .put(`/api/zones/${zoneId}/subzones/${subzoneId}`, payload)
            .then((res) => {
                // after saving, navigate back to zone detail
                navigate(`/zones/${zoneId}`);
            })
            .catch((err) => {
                console.error('Failed to save subzone:', err);
                alert('Error saving subzone. Check console.');
            });
    };

    if (loading || !subZone) {
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
            <div className="mb-3">
                <Link to={`/zones/${zoneId}`} className="btn btn-outline-primary">
                    ← Back to Zone
                </Link>
            </div>

            <div className="card shadow-sm p-4">
                <h4 className="mb-4">Edit Subzone #{subZone.subzoneIndex}</h4>

                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div className="mb-3">
                        <label className="form-label">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Plant Type dropdown */}
                    <div className="mb-3">
                        <label className="form-label">Plant Type</label>
                        <select
                            className="form-select"
                            name="plantTypeId"
                            value={formData.plantTypeId}
                            onChange={handleChange}
                        >
                            <option value="">-- None --</option>
                            {plantTypes.map((pt) => (
                                <option key={pt.id} value={pt.id}>
                                    {pt.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Soil Type dropdown */}
                    <div className="mb-3">
                        <label className="form-label">Soil Type</label>
                        <select
                            className="form-select"
                            name="soilTypeId"
                            value={formData.soilTypeId}
                            onChange={handleChange}
                        >
                            <option value="">-- None --</option>
                            {soilTypes.map((st) => (
                                <option key={st.id} value={st.id}>
                                    {st.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Extra Info */}
                    <div className="mb-3">
                        <label className="form-label">Extra Info</label>
                        <textarea
                            className="form-control"
                            name="extraInfo"
                            rows="2"
                            value={formData.extraInfo}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    {/* Default Irrigation Duration */}
                    <div className="mb-3">
                        <label className="form-label">
                            Default Irrigation Duration (seconds)
                        </label>
                        <input
                            type="number"
                            className="form-control"
                            name="defaultIrrigationDurationInSeconds"
                            value={formData.defaultIrrigationDurationInSeconds}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate(`/zones/${zoneId}`)}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Save Subzone
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
