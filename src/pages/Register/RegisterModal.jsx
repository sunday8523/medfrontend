// src/pages/Register/RegisterModal.jsx
import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaLock, FaIdBadge, FaTimes, FaCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";

export default function RegisterModal({ closeModal }) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });

  const [passwordValid, setPasswordValid] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      setPasswordValid({
        length: value.length >= 8,
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[@!%*?&()]/.test(value),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.username || !formData.email || !formData.password) {
      toast.error("กรุณากรอกข้อมูลให้ครบทุกช่อง ❌");
      return;
    }

    try {
      const payload = { ...formData, role: "member" };
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, payload);
      toast.success(response.data.message || "สมัครสมาชิกสำเร็จ 🎉");
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่ภายหลัง ❌");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ duration: 0.25 }}
        className="bg-gradient-to-br from-purple-100/70 to-purple-200/50 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-md p-8"
      >
        <h2 className="text-3xl font-bold mb-6 text-purple-700 text-center flex items-center justify-center gap-2">
          📝 สมัครสมาชิก
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="flex items-center border border-purple-200 rounded-xl bg-white/70 backdrop-blur-sm focus-within:ring-2 focus-within:ring-purple-300 transition">
            <FaIdBadge className="ml-3 text-purple-400" />
            <input
              type="text"
              name="name"
              placeholder="ชื่อ"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-3 py-2 pr-4 bg-transparent focus:outline-none"
              required
            />
          </div>

          {/* Username */}
          <div className="flex items-center border border-purple-200 rounded-xl bg-white/70 backdrop-blur-sm focus-within:ring-2 focus-within:ring-purple-300 transition">
            <FaUser className="ml-3 text-purple-400" />
            <input
              type="text"
              name="username"
              placeholder="ชื่อผู้ใช้"
              value={formData.username}
              onChange={handleChange}
              className="w-full pl-3 py-2 pr-4 bg-transparent focus:outline-none"
              required
            />
          </div>

          {/* Email */}
          <div className="flex items-center border border-purple-200 rounded-xl bg-white/70 backdrop-blur-sm focus-within:ring-2 focus-within:ring-purple-300 transition">
            <FaEnvelope className="ml-3 text-purple-400" />
            <input
              type="email"
              name="email"
              placeholder="อีเมล"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-3 py-2 pr-4 bg-transparent focus:outline-none"
              required
            />
          </div>

          {/* Password */}
          <div className="flex items-center border border-purple-200 rounded-xl bg-white/70 backdrop-blur-sm focus-within:ring-2 focus-within:ring-purple-300 transition">
            <FaLock className="ml-3 text-purple-400" />
            <input
              type="password"
              name="password"
              placeholder="รหัสผ่าน"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-3 py-2 pr-4 bg-transparent focus:outline-none"
              required
            />
          </div>

          {/* Password Validation */}
          <ul className="text-sm mt-2 space-y-1">
            <li className={passwordValid.length ? "text-green-500 flex items-center gap-1" : "text-gray-400 flex items-center gap-1"}>
              {passwordValid.length ? <FaCheck /> : "•"} อย่างน้อย 8 ตัวอักษร
            </li>
            <li className={passwordValid.upper ? "text-green-500 flex items-center gap-1" : "text-gray-400 flex items-center gap-1"}>
              {passwordValid.upper ? <FaCheck /> : "•"} ตัวอักษรพิมพ์ใหญ่ (A-Z)
            </li>
            <li className={passwordValid.lower ? "text-green-500 flex items-center gap-1" : "text-gray-400 flex items-center gap-1"}>
              {passwordValid.lower ? <FaCheck /> : "•"} ตัวอักษรพิมพ์เล็ก (a-z)
            </li>
            <li className={passwordValid.number ? "text-green-500 flex items-center gap-1" : "text-gray-400 flex items-center gap-1"}>
              {passwordValid.number ? <FaCheck /> : "•"} ตัวเลข (0-9)
            </li>
            <li className={passwordValid.special ? "text-green-500 flex items-center gap-1" : "text-gray-400 flex items-center gap-1"}>
              {passwordValid.special ? <FaCheck /> : "•"} อักขระพิเศษ (@!%*?&())
            </li>
          </ul>

          {/* Buttons */}
          <div className="flex justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-200 hover:bg-purple-300 text-purple-700 font-semibold py-2 rounded-xl transition shadow-md hover:shadow-lg"
            >
              <FaTimes /> ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!Object.values(passwordValid).every(Boolean)}
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-300 to-purple-400 hover:from-purple-400 hover:to-purple-500 text-white font-semibold py-2 rounded-xl transition shadow-lg hover:shadow-purple-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <FaCheck /> สมัครสมาชิก
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
