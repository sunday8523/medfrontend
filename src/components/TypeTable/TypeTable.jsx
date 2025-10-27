// src/components/TypeTable/TypeTable.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";
import ConfirmModal from "../ConfirmModal/ConfirmModal";

const TypeTable = () => {
  const [types, setTypes] = useState([]);
  const [deleteId, setDeleteId] = useState(null); // id ที่ต้องการลบ
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const fetchTypes = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/types`);
      setTypes(res.data);
    } catch (error) {
      console.error(error);
      toast.error("โหลดข้อมูลล้มเหลว ❌");
    }
  };

  const handleDelete = (type_id) => {
    setDeleteId(type_id);
    setIsConfirmOpen(true); // เปิด modal ยืนยัน
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/types/${deleteId}`);
      toast.success("ลบเรียบร้อย ✅");
      fetchTypes();
    } catch (error) {
      console.error(error);
      toast.error("ลบไม่สำเร็จ ❌");
    } finally {
      setIsConfirmOpen(false);
      setDeleteId(null);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-xl shadow-sm">
        <thead className="bg-purple-100 text-purple-700">
          <tr>
            <th className="px-4 py-2 text-left">ID</th>
            <th className="px-4 py-2 text-left">ชื่อประเภทยา</th>
            <th className="px-4 py-2 text-center">การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {types.length > 0 ? (
            types.map((t) => (
              <tr key={t.type_id} className="border-t hover:bg-purple-50 transition">
                <td className="px-4 py-2">{t.type_id}</td>
                <td className="px-4 py-2">{t.type}</td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => handleDelete(t.type_id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-1 mx-auto transition"
                  >
                    <Trash2 size={16} /> ลบ
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center text-gray-500 py-4">
                ไม่มีข้อมูล
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Confirm Modal */}
      {isConfirmOpen && (
        <ConfirmModal
          title="ยืนยันการลบ"
          description="คุณแน่ใจหรือไม่ที่จะลบประเภทนี้?"
          onConfirm={confirmDelete}
          onCancel={() => setIsConfirmOpen(false)}
        />
      )}
    </div>
  );
};

export default TypeTable;
