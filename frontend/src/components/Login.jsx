// src/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        const formBody = new URLSearchParams();
        formBody.append('username', username);
        formBody.append('password', password);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formBody.toString(),
                credentials: 'include',
            });

            if (response.ok) {
                navigate('/zones');
            } else if (response.status === 401 || response.status === 403) {
                setErrorMsg('Invalid username or password');
            } else {
                setErrorMsg(`Login failed with status ${response.status}`);
            }
        } catch (err) {
            console.error('Login error', err);
            setErrorMsg('Network error. Please try again.');
        }
    };

    const containerStyle = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f4f7fa',
        fontFamily: 'Arial, sans-serif',
    };

    const cardStyle = {
        backgroundColor: '#ffffff',
        padding: '2rem 2.5rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
    };

    const titleStyle = {
        marginBottom: '1.5rem',
        fontSize: '1.75rem',
        color: '#2c3e50',
        textAlign: 'center',
    };

    const inputContainerStyle = {
        marginBottom: '1rem',
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        color: '#34495e',
        fontSize: '0.95rem',
    };

    const inputStyle = {
        width: '100%',
        padding: '0.6rem 0.8rem',
        borderRadius: '4px',
        border: '1px solid #ccd0d5',
        fontSize: '1rem',
        boxSizing: 'border-box',
    };

    const buttonStyle = {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: '#27ae60',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        fontSize: '1rem',
        cursor: 'pointer',
        marginTop: '0.5rem',
    };

    const errorStyle = {
        color: '#e74c3c',
        marginBottom: '1rem',
        textAlign: 'center',
        fontSize: '0.9rem',
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                <h2 style={titleStyle}>Municipal Irrigation Portal</h2>
                {errorMsg && <div style={errorStyle}>{errorMsg}</div>}
                <form onSubmit={handleSubmit}>
                    <div style={inputContainerStyle}>
                        <label htmlFor="username" style={labelStyle}>
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <div style={inputContainerStyle}>
                        <label htmlFor="password" style={labelStyle}>
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={inputStyle}
                        />
                    </div>
                    <button type="submit" style={buttonStyle}>
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
