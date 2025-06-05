// src/components/PlantTypesView.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function PlantTypesView() {
    const [plantTypes, setPlantTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        optimalMoistureMin: 0,
        optimalMoistureMax: 0,
    });
    const [currentUserRoles, setCurrentUserRoles] = useState([]);

    useEffect(() => {
        // Отримати роль користувача
        axios
            .get('/api/current-user')
            .then((res) => setCurrentUserRoles(res.data.role))
            .catch(console.error);

        // Завантажити PlantType
        axios
            .get('/api/plant-types')
            .then((res) => {
                setPlantTypes(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const isMaintainerOrAdmin = () => {
        return currentUserRoles.includes('MAINTAINER') || currentUserRoles.includes('ADMIN');
    };

    const resetForm = () => {
        setEditing(null);
        setFormData({
            name: '',
            description: '',
            optimalMoistureMin: 0,
            optimalMoistureMax: 0,
        });
    };

    const handleEditClick = (pt) => {
        setEditing(pt);
        setFormData({
            name: pt.name,
            description: pt.description,
            optimalMoistureMin: pt.optimalMoistureMin,
            optimalMoistureMax: pt.optimalMoistureMax,
        });
    };

    const handleDelete = (id) => {
        if (!window.confirm('Are you sure you want to delete this plant type?')) return;
        axios
            .delete(`/api/plant-types/${id}`)
            .then(() => {
                setPlantTypes(plantTypes.filter((pt) => pt.id !== id));
            })
            .catch(console.error);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData };
        if (editing) {
            axios
                .put(`/api/plant-types/${editing.id}`, payload)
                .then((res) => {
                    setPlantTypes(plantTypes.map((pt) => (pt.id === res.data.id ? res.data : pt)));
                    resetForm();
                })
                .catch(console.error);
        } else {
            axios
                .post('/api/plant-types', payload)
                .then((res) => {
                    setPlantTypes([...plantTypes, res.data]);
                    resetForm();
                })
                .catch(console.error);
        }
    };

    if (loading) {
        return <div>Loading plant types…</div>;
    }

    return (
        <div>
            <h3>Plant Types</h3>
            {!isMaintainerOrAdmin() && <small className="text-muted">You have read-only access.</small>}

            {isMaintainerOrAdmin() && (
                <form onSubmit={handleFormSubmit} className="mb-4">
                    <div className="row g-2 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label">Description</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Moisture Min</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.optimalMoistureMin}
                                onChange={(e) =>
                                    setFormData({ ...formData, optimalMoistureMin: parseInt(e.target.value, 10) })
                                }
                                required
                            />
                        </div>
                        <div className="col-md-2">
                            <label className="form-label">Moisture Max</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.optimalMoistureMax}
                                onChange={(e) =>
                                    setFormData({ ...formData, optimalMoistureMax: parseInt(e.target.value, 10) })
                                }
                                required
                            />
                        </div>
                        <div className="col-md-1 text-end">
                            <button type="submit" className="btn btn-primary btn-sm">
                                {editing ? 'Save' : 'Create'}
                            </button>
                        </div>
                    </div>
                </form>
            )}

            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Min</th>
                        <th>Max</th>
                        {isMaintainerOrAdmin() && <th>Actions</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {plantTypes.map((pt) => (
                        <tr key={pt.id}>
                            <td>{pt.name}</td>
                            <td>{pt.description}</td>
                            <td>{pt.optimalMoistureMin}</td>
                            <td>{pt.optimalMoistureMax}</td>
                            {isMaintainerOrAdmin() && (
                                <td>
                                    <button
                                        className="btn btn-sm btn-outline-secondary me-2"
                                        onClick={() => handleEditClick(pt)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(pt.id)}
                                        style={{ marginTop: '0.2rem' }}
                                    >
                                        Delete
                                    </button>
                                </td>

                            )}
                        </tr>
                    ))}
                    {plantTypes.length === 0 && (
                        <tr>
                            <td colSpan={isMaintainerOrAdmin() ? 5 : 4} className="text-center">
                                No plant types found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
