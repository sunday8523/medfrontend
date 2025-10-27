// File: Quantity.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaWarehouse, FaBoxes } from 'react-icons/fa';

export default function Quantity() {
  const [medStats, setMedStats] = useState({
    total_amount: 0,
    main_stock: 0,
    secondary_stock: 0,
  });

  useEffect(() => {
    const fetchMedStats = async () => {
      try {
        // เรียก backend จาก quantityRoutes.js
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/quantity/med-stats`);
        setMedStats(res.data);
      } catch (err) {
        console.error('Error fetching med stats:', err);
      }
    };

    fetchMedStats();

    // หากต้องการ refresh ทุก 10 วินาที
    // const interval = setInterval(fetchMedStats, 10000);
    // return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50 py-6"> {/* ใช้ py-6 แทน p-6 เพื่อไม่ให้เต็มหน้าจอ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* ยาทั้งหมด */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:shadow-xl transition duration-300">
          <FaBoxes className="text-indigo-500 text-4xl mb-3" />
          <h2 className="text-gray-500 text-sm">จำนวนเวชภัณฑ์ทั้งหมด</h2>
          <p className="text-3xl font-bold text-gray-800">{medStats.total_amount}</p>
        </div>

        {/* คลังหลัก */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:shadow-xl transition duration-300">
          <FaWarehouse className="text-green-500 text-4xl mb-3" />
          <h2 className="text-gray-500 text-sm">คลังหลัก</h2>
          <p className="text-3xl font-bold text-gray-800">{medStats.main_stock}</p>
        </div>

        {/* คลังรอง */}
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center hover:shadow-xl transition duration-300">
          <FaWarehouse className="text-yellow-500 text-4xl mb-3" />
          <h2 className="text-gray-500 text-sm">คลังเตรียมเบิกจ่าย</h2>
          <p className="text-3xl font-bold text-gray-800">{medStats.secondary_stock}</p>
        </div>
      </div>
    </div>
  );
}
