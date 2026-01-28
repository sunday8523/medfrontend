import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Seiha from "../../assets/GotQ3aSXMAAangF.jpg";
import pic from "../../assets/bg452524.png";

const Login = () => {
    const [values, setValues] = useState({ email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            navigate('/home');
        }
    }, [navigate]);

    const handleChanges = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        // --- LOG 01 ---
        console.log("--- handleSubmit_01: ฟังก์ชันเริ่มทำงาน ---");
        e.preventDefault();

        if (!values.email || !values.password) {
            // --- LOG 02 ---
            console.log("--- handleSubmit_02: ล้มเหลว (ช่องว่าง) ---");
            setErrorMessage('กรุณากรอกอีเมลและรหัสผ่าน');
            return;
        }

        // --- LOG 03 ---
        console.log("--- handleSubmit_03: ข้อมูลครบถ้วน ---");

        try {
            const apiUrl = import.meta.env.VITE_API_URL;

            // --- LOG 04 ---
            console.log("--- handleSubmit_04: กำลังเรียก API ไปที่:", `${apiUrl}/auth/login`);

            const response = await axios.post(`${apiUrl}/auth/login`, values);

            // --- LOG 05 ---
            console.log("--- handleSubmit_05: เรียก API สำเร็จ", response.data);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                navigate('/home');
            } else {
                setErrorMessage('เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่');
            }
        } catch (err) {
            // --- LOG 06 ---
            console.log("--- handleSubmit_06: ล้มเหลว (เข้า CATCH) ---");

            // Log error แบบละเอียด
            if (err.response) {
                // เซิร์ฟเวอร์ตอบกลับมา (เช่น 404, 401, 500)
                console.error("Error Response (ข้อมูลจาก Server):", err.response.data);
                console.error("Error Status (โค้ดที่ Server ตอบ):", err.response.status);
            } else if (err.request) {
                // Request ถูกส่งไป แต่ไม่ได้รับการตอบกลับ (เช่น Render หลับ, CORS)
                console.error("Error Request (ส่งไปแล้วแต่ไม่ตอบกลับ):", err.request);
            } else {
                // Error อื่นๆ (เช่น ตั้งค่า axios ผิด)
                console.error("Error Message (ปัญหาตอนตั้งค่า):", err.message);
            }

            const message = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่ภายหลัง';
            setErrorMessage(message);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url(${pic})` }}
        >
            <div className="px-8 py-6 rounded-2xl bg-transparent backdrop-blur-lg border border-white/20 shadow-xl w-full max-w-sm mx-4">
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

