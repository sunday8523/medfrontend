import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Box, Tag, Calendar, Package } from "lucide-react";

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
        const typesRes = await axios.get(`${process.env.VITE_API_URL}/api/types`);
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
      await axios.post(`${process.env.VITE_API_URL}/api/adddata`, form);
      addPopup("success", "เพิ่มข้อมูลยาเรียบร้อยแล้ว ✅");
      setForm({ med_name: "", amount: "", type: "", expire: "" });
      onClose();
    } catch (error) {
      addPopup("error", error.response?.data?.message || "เกิดข้อผิดพลาด ❌");
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
      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl p-6 w-[420px] max-w-full mx-4 relative"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6 border-b pb-3">
                <h3 className="text-2xl font-semibold text-gray-900">เพิ่มข้อมูลยา</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-700 transition"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-sm">
                {/* ชื่อยา */}
                <div className="relative">
                  <label className="block font-medium text-gray-700 mb-1">ชื่อยา</label>
                  <div className="relative">
                    <Box className="absolute left-3 top-3 text-purple-300" size={18} />
                    <input
                      name="med_name"
                      placeholder="ชื่อยา"
                      value={form.med_name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-purple-200 shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition"
                    />
                  </div>
                </div>

                {/* จำนวน */}
                <div className="relative">
                  <label className="block font-medium text-gray-700 mb-1">จำนวน</label>
                  <div className="relative">
                    <Package className="absolute left-3 top-3 text-purple-300" size={18} />
                    <input
                      name="amount"
                      type="number"
                      placeholder="จำนวน"
                      value={form.amount}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-purple-200 shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition"
                    />
                  </div>
                </div>

                {/* ประเภทยา */}
                <div className="relative">
                  <label className="block font-medium text-gray-700 mb-1">ประเภทยา</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-3 text-purple-300" size={18} />
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-purple-200 shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition"
                    >
                      <option value="">-- เลือกประเภทยา --</option>
                      {types.map((t) => (
                        <option key={t.type_id} value={t.type}>
                          {t.type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* วันหมดอายุ */}
                <div className="relative">
                  <label className="block font-medium text-gray-700 mb-1">วันหมดอายุ</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-purple-300" size={18} />
                    <input
                      name="expire"
                      type="date"
                      value={form.expire}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-2 rounded-xl border border-purple-200 shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition"
                    />
                  </div>
                </div>

                {/* Save Button with pulse on hover */}
                <button
                  type="submit"
                  className="w-full py-2 bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-medium rounded-xl shadow-md transition-all animate-pulse-on-hover"
                >
                  บันทึก
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup แจ้งเตือนมุมขวาล่าง */}
      <div className="fixed bottom-5 right-5 space-y-2 z-[60]">
        {popups.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`flex items-center gap-3 px-4 py-2 rounded-xl shadow-md text-white ${
              p.type === "success" ? "bg-purple-500" : "bg-red-500"
            }`}
          >
            {p.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="text-sm">{p.message}</p>
          </motion.div>
        ))}
      </div>

      {/* Tailwind CSS custom animation */}
      <style jsx>{`
        .animate-pulse-on-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .animate-pulse-on-hover:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
        }
      `}</style>
    </>
  );
}

export default AddMedicine;
