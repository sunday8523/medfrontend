import React, { useState, useEffect, useRef } from "react";
import MedicineTable from "../medicinestable/medicinetable.jsx";
import TypeAddForm from "../TypeAddForm/TypeAddForm.jsx";
import TypeTable from "../TypeTable/TypeTable.jsx";
import AddMedicine from "../add/med_add_table.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, PlusCircle, ClipboardList } from "lucide-react";

const MedData = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isTypeAddPopupOpen, setIsTypeAddPopupOpen] = useState(false);
  const [isTypeTablePopupOpen, setIsTypeTablePopupOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  // ปิด dropdown ถ้ากดนอก
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* แถวบน: ปุ่มอยู่ขวา */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800"></h2>
        <div className="flex gap-4" ref={dropdownRef}>
          {/* ปุ่มเพิ่มรายการ */}
          <button
            onClick={() => setIsPopupOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-md flex items-center gap-2 transition-all"
          >
            <PlusCircle size={18} /> เพิ่มรายการ
          </button>

          {/* Dropdown จัดการประเภทยา */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <ClipboardList size={18} />
              จัดการประเภทบรรจุภัณฑ์
              <ChevronDown size={16} />
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setIsTypeAddPopupOpen(true);
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                  >
                    <PlusCircle size={16} className="text-green-600" />
                    เพิ่มประเภทบรรจุภํณฑ์
                  </button>
                  <button
                    onClick={() => {
                      setIsTypeTablePopupOpen(true);
                      setDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                  >
                    <ClipboardList size={16} className="text-blue-600" />
                    ตารางประเภทบรรจุภํณฑ์
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ตารางยาหลัก */}
      <div className="bg-white shadow-md rounded-xl p-4">
        <MedicineTable />
      </div>

      {/* ✅ Popup เพิ่มรายการยา ใช้ AddMedicine แทน */}
      <AddMedicine isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />

      {/* Popup เพิ่มประเภทยา */}
      <AnimatePresence>
        {isTypeAddPopupOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsTypeAddPopupOpen(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl p-6 w-[400px] relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <TypeAddForm closePopup={() => setIsTypeAddPopupOpen(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Popup ตารางประเภทยา */}
      <AnimatePresence>
        {isTypeTablePopupOpen && (
          <motion.div
            className="fixed inset-0 bg-black/60 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsTypeTablePopupOpen(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl p-6 w-[650px] relative max-h-[80vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              <TypeTable />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ToastContainer position="bottom-right" autoClose={2500} theme="colored" />
    </div>
  );
};

export default MedData;
