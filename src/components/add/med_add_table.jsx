import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Pill } from "lucide-react";

function AddMedicine({ isOpen, onClose }) {
  const [form, setForm] = useState({
    med_name: "",
    amount: "",
    type: "",
    expire: "",
  });
  const [types, setTypes] = useState([]);
  const [popups, setPopups] = useState([]);

  useEffect(() => {
    async function fetchTypes() {
      try {
        const typesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/types`);
        setTypes(typesRes.data);
      } catch (error) {
        console.error("Error fetching types:", error);
      }
    }
    fetchTypes();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/adddata`, form);
      addPopup("success", "เพิ่มข้อมูลยาเรียบร้อยแล้ว");
      setForm({ med_name: "", amount: "", type: "", expire: "" });
      onClose();
    } catch (error) {
      addPopup("error", error.response?.data?.message || "เกิดข้อผิดพลาด");
      console.error(error);
    }
  };

  const addPopup = (type, message) => {
    const id = Date.now();
    setPopups((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setPopups((prev) => prev.filter((p) => p.id !== id)), 3000);
  };

  return (
    <>
      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-8 w-[460px] max-w-full relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Pill className="text-purple-600" size={22} />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800">
                    เพิ่มข้อมูลยา
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={22} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* ชื่อยา */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อยา
                  </label>
                  <input
                    name="med_name"
                    placeholder="กรอกชื่อยา"
                    value={form.med_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition"
                  />
                </div>

                {/* จำนวน */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    จำนวน
                  </label>
                  <input
                    name="amount"
                    type="number"
                    placeholder="กรอกจำนวน"
                    value={form.amount}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition"
                  />
                </div>

                {/* ประเภทยา */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ประเภทยา
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition bg-white"
                  >
                    <option value="">เลือกประเภทยา</option>
                    {types.map((t) => (
                      <option key={t.type_id} value={t.type}>
                        {t.type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* วันหมดอายุ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    วันหมดอายุ
                  </label>
                  <input
                    name="expire"
                    type="date"
                    value={form.expire}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none transition"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition"
                  >
                    บันทึก
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup แจ้งเตือนมุมขวาล่าง */}
      <div className="fixed bottom-6 right-6 space-y-3 z-[60]">
        <AnimatePresence>
          {popups.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${
                p.type === "success" 
                  ? "bg-green-500" 
                  : "bg-red-500"
              }`}
            >
              {p.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <p className="text-sm font-medium">{p.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

export default AddMedicine;