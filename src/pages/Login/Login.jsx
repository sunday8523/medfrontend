import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Seiha from "../../assets/GotQ3aSXMAAangF.jpg"; 
import pic from "../../assets/bg452524.png";

const Login = () => {
    const [values, setValues] = useState({ email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // เพิ่ม useEffect เพื่อเช็ค token เมื่อ Component โหลด
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // ถ้ามี token อยู่แล้ว ให้พาไปหน้าหลักเลย
            navigate('/home'); 
        }
    }, [navigate]);

    const handleChanges = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!values.email || !values.password) {
            setErrorMessage('กรุณากรอกอีเมลและรหัสผ่าน');
            return;
        }

        try {
            const response = await axios.post(`${process.env.VITE_API_URL}/auth/login`, values);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                // ไม่ต้องใช้ jwt_decode ตรงนี้เพราะแค่เก็บค่าไว้เฉยๆ
                navigate('/home');
            } else {
                setErrorMessage('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่');
            }
        } catch (err) {
            // ปรับปรุงการแสดงผล error ให้ชัดเจนและไม่แสดง object error ทั้งก้อน
            const message = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่ภายหลัง';
            setErrorMessage(message);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url(${pic})` }}
        >
            <div className="px-8 py-6 rounded-2xl bg-transparent backdrop-blur-lg border border-white/20 shadow-xl w-80">
                <h1 className="text-center font-bold text-3xl text-black">Login</h1>
                <form className="my-6" onSubmit={handleSubmit}>
                    <input
                        name="email"
                        value={values.email}
                        onChange={handleChanges}
                        className="p-2 my-2 rounded w-full bg-white/10 text-black placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Email"
                        type="email"
                        required
                    />
                    <input
                        name="password"
                        value={values.password}
                        onChange={handleChanges}
                        className="p-2 my-2 rounded w-full bg-white/10 text-black placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Password"
                        type="password"
                        required
                    />
                    {errorMessage && (
                        <p className="text-red-400 text-sm mt-2 text-center">{errorMessage}</p>
                    )}
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-500 text-white font-semibold p-2 mt-3 rounded w-full transition-colors duration-300"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;