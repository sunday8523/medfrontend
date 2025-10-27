import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaUser, FaEnvelope, FaIdBadge, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const UserSettingsModal = ({ isOpen, onClose }) => {
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({ username: "", email: "", name: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValid, setPasswordValid] = useState({ length: false, upper: false, lower: false, number: false, special: false });

  // ดึงข้อมูลผู้ใช้
  useEffect(() => {
    if (!isOpen) {
      setFormData({ username: "", email: "", name: "", password: "" });
      setUserData(null);
      return;
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${process.env.VITE_API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } });
        setUserData(res.data);
        setFormData({ username: res.data.username, email: res.data.email, name: res.data.name, password: "" });
      } catch (err) {
        console.error(err);
        toast.error("❌ ไม่สามารถดึงข้อมูลผู้ใช้ได้");
      }
    };

    fetchUserData();
  }, [isOpen]);

  // ตรวจสอบ password real-time
  useEffect(() => {
    const { password } = formData;
    setPasswordValid({
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[@!%*?&()]/.test(password),
    });
  }, [formData.password]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validatePassword = (password) => {
    if (!password) return true;
    return Object.values(passwordValid).every(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword(formData.password)) {
      toast.error("⚠️ รหัสผ่านไม่ปลอดภัย! ตรวจสอบเงื่อนไขให้ครบ");
      return;
    }

    const payload = {};
    if (formData.username.trim() !== "" && formData.username !== userData?.username) payload.username = formData.username.trim();
    if (formData.email.trim() !== "" && formData.email !== userData?.email) payload.email = formData.email.trim();
    if (formData.name.trim() !== "" && formData.name !== userData?.name) payload.name = formData.name.trim();
    if (formData.password) payload.password = formData.password;

    if (Object.keys(payload).length === 0) {
      toast.info("ไม่มีข้อมูลให้เปลี่ยนแปลง 😎");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(`${process.env.VITE_API_URL}/api/users/update`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setUserData(prev => ({ ...prev, ...payload }));
      setFormData(prev => ({ ...prev, password: "" }));

      toast.success("✅ บันทึกการเปลี่ยนแปลงสำเร็จ!");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "❌ อัปเดตไม่สำเร็จ");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden"
            initial={{ scale: 0.9, opacity: 0, y: -30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500">
              <FaTimes size={20} />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">⚙️ ตั้งค่าผู้ใช้</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center border rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition">
                <FaIdBadge className="text-blue-500 mr-3" />
                <input type="text" name="username" value={formData.username} onChange={handleChange} className="flex-1 outline-none bg-transparent" />
              </div>

              <div className="flex items-center border rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition">
                <FaEnvelope className="text-green-500 mr-3" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="flex-1 outline-none bg-transparent" />
              </div>

              <div className="flex items-center border rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition">
                <FaUser className="text-purple-500 mr-3" />
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="flex-1 outline-none bg-transparent" />
              </div>

              <div className="flex items-center border rounded-xl px-3 py-2 shadow-sm hover:shadow-md transition relative">
                <FaLock className="text-red-500 mr-3" />
                <input type={showPassword ? "text" : "password"} name="password" placeholder="กรอกรหัสใหม่ (ถ้าต้องการเปลี่ยน)" value={formData.password} onChange={handleChange} className="flex-1 outline-none bg-transparent pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              {/* รายการเงื่อนไข password */}
              <ul className="text-sm mt-2 space-y-1">
                <li className={passwordValid.length ? "text-green-500" : "text-gray-500"}>• อย่างน้อย 8 ตัวอักษร</li>
                <li className={passwordValid.upper ? "text-green-500" : "text-gray-500"}>• ตัวอักษรพิมพ์ใหญ่ (A-Z)</li>
                <li className={passwordValid.lower ? "text-green-500" : "text-gray-500"}>• ตัวอักษรพิมพ์เล็ก (a-z)</li>
                <li className={passwordValid.number ? "text-green-500" : "text-gray-500"}>• ตัวเลข (0-9)</li>
                <li className={passwordValid.special ? "text-green-500" : "text-gray-500"}>• อักขระพิเศษ (@!%*?&())</li>
              </ul>

              <motion.button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white py-3 rounded-xl shadow-lg font-semibold tracking-wide" whileTap={{ scale: 0.95 }}>
                💾 บันทึกการเปลี่ยนแปลง
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UserSettingsModal;
