import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [values, setValues] = useState({ name: '', username: '', email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const navigate = useNavigate();

    const handleChanges = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!values.name || !values.username || !values.email || !values.password) {
            setErrorMessage('กรุณากรอกข้อมูลให้ครบทุกช่อง');
            return;
        }

        try {
            const token = localStorage.getItem('token');

            // เพิ่ม role: 'member' ลงใน payload
            const payload = { ...values, role: 'member' };

            const response = await axios.post('http://localhost:3000/auth/register', payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setSuccessMessage(response.data.message);
            setErrorMessage('');
            setTimeout(() => {
                navigate('/login');
            }, 1500);
        } catch (err) {
            setErrorMessage(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง');
            setSuccessMessage('');
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    return (
        <div className="flex bg-gray-100 min-h-screen items-center justify-center">
            <div className="relative p-8 rounded-3xl bg-purple-100 border border-purple-300 shadow-2xl w-full max-w-sm transform transition-all duration-500 hover:scale-105">
                <h1 className="text-center font-bold text-4xl text-purple-800 mb-6 animate-fade-in">Register</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Name"
                        value={values.name}
                        onChange={handleChanges}
                        className="p-3 my-2 rounded-xl w-full bg-purple-50 text-purple-800 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                        required
                    />
                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        value={values.username}
                        onChange={handleChanges}
                        className="p-3 my-2 rounded-xl w-full bg-purple-50 text-purple-800 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={values.email}
                        onChange={handleChanges}
                        className="p-3 my-2 rounded-xl w-full bg-purple-50 text-purple-800 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={values.password}
                        onChange={handleChanges}
                        className="p-3 my-2 rounded-xl w-full bg-purple-50 text-purple-800 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-300"
                        required
                    />

                    {errorMessage && (
                        <p className="text-red-600 text-sm mt-4 text-center animate-fade-in">{errorMessage}</p>
                    )}
                    {successMessage && (
                        <p className="text-green-600 text-sm mt-4 text-center animate-fade-in">{successMessage}</p>
                    )}

                    <button
                        type="submit"
                        className="bg-purple-600 hover:bg-purple-500 text-white font-semibold p-3 mt-6 rounded-xl w-full transition-colors duration-300 transform hover:-translate-y-1"
                    >
                        Register
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
