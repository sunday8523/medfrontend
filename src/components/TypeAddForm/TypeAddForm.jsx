import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const TypeAddForm = ({ closePopup }) => {
  const [typeName, setTypeName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!typeName.trim()) return toast.error("กรุณากรอกชื่อประเภทยา");

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/types`, { type: typeName });
      toast.success("เพิ่มประเภทเรียบร้อย 🎉");
      closePopup();
      setTypeName("");
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาด ❌");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4"
    >
      <label className="font-medium text-gray-700">ชื่อประเภทยา</label>
      <input
        type="text"
        value={typeName}
        onChange={(e) => setTypeName(e.target.value)}
        placeholder="เช่น แผงบลิสเตอร์"
        required
        className="w-full px-4 py-2 rounded-xl border border-purple-200 shadow-sm focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition"
      />

      <button
        type="submit"
        className="w-full py-2 mt-2 bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white font-medium rounded-xl shadow-md transition-all animate-pulse-on-hover"
      >
        บันทึก
      </button>

      {/* Tailwind animation */}
      <style jsx>{`
        .animate-pulse-on-hover {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .animate-pulse-on-hover:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
        }
      `}</style>
    </form>
  );
};

export default TypeAddForm;
