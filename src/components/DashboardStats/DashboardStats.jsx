// src/components/DashboardStats/DashboardStats.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, CartesianGrid, Area
} from "recharts";
import { motion } from "framer-motion";
import { Activity, Calendar, AlertTriangle, Trophy } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import THSarabun from "../../fonts/THSarabun.ttf.base64"; // ฟอนต์ภาษาไทย (normal เท่านั้น)

const DashboardStats = () => {
  const [topMeds, setTopMeds] = useState([]);
  const [bottomMeds, setBottomMeds] = useState([]);
  const [withdrawByDate, setWithdrawByDate] = useState([]);
  const [summary, setSummary] = useState({});
  const [hoverIndexTop, setHoverIndexTop] = useState(null);
  const [hoverIndexBottom, setHoverIndexBottom] = useState(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/logs/stats`)
      .then(res => {
        setTopMeds(res.data.topMeds);
        setBottomMeds(res.data.bottomMeds);
        setWithdrawByDate(res.data.withdrawByDate);
        setSummary(res.data.summary);
      })
      .catch(console.error);
  }, []);

  const summaryCards = [
    { icon: <Activity size={32} />, label: "จำนวนที่เบิกทั้งหมดในเดือนนี้", value: summary.totalWithdraw, bg: "from-blue-500 to-blue-600" },
    { icon: <Trophy size={32} />, label: "ยาที่เบิกมากสุดเดือนนี้", value: topMeds[0]?.med_name || "-", bg: "from-green-500 to-green-600" },
    { icon: <Calendar size={32} />, label: "วันที่เบิกมากสุด", value: summary.topDate, bg: "from-yellow-500 to-yellow-600" },
    { icon: <AlertTriangle size={32} />, label: "ยาที่เบิกน้อยสุด", value: bottomMeds[0]?.med_name || "-", bg: "from-red-500 to-red-600" },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 }
    })
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { delay: 0.4, duration: 0.6 } }
  };

  // ------------------- PDF Generator -------------------
  const generatePDF = () => {
    const doc = new jsPDF("landscape");
    const today = new Date();
    
    const generationDate = today.toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const reportMonth = today.toLocaleDateString('th-TH', {
      month: 'long', year: 'numeric'
    });
    const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    doc.addFileToVFS("THSarabun.ttf", THSarabun);
    doc.addFont("THSarabun.ttf", "THSarabun", "normal");
    doc.setFont("THSarabun", "normal");

    const pageHeight = doc.internal.pageSize.height || doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth();
    const margin = { top: 25, right: 14, bottom: 20, left: 14 };

    const pageHeaderFooter = (data) => {
      doc.setFont("THSarabun", "normal");
      doc.setFontSize(14);
      doc.text("รายงานสรุปการเบิกยา", margin.left, 15);
      doc.setFontSize(10);
      doc.text(`สร้างเมื่อ: ${generationDate}`, pageWidth - margin.right, 15, { align: 'right' });
      doc.setLineWidth(0.2);
      doc.line(margin.left, 18, pageWidth - margin.right, 18);

      doc.setFontSize(10);
      doc.text("ระบบจัดการคลังยา", margin.left, pageHeight - 10);
      doc.text(`หน้า ${data.pageNumber}`, pageWidth - margin.right, pageHeight - 10, { align: 'right' });
    };

    doc.setFontSize(20);
    doc.text("รายงานสรุปการเบิกยา", pageWidth / 2, 35, { align: 'center' });
    doc.setFontSize(16);
    doc.text(`ประจำเดือน ${reportMonth}`, pageWidth / 2, 45, { align: 'center' });

    const summaryBody = [
      ['จำนวนที่เบิกทั้งหมดในเดือนนี้:', { content: summary.totalWithdraw || 0, styles: { halign: 'left' } }],
      ['ยาที่เบิกมากสุดเดือนนี้:', { content: topMeds[0]?.med_name || "-", styles: { halign: 'left' } }],
      ['วันที่เบิกมากสุด:', { content: summary.topDate || "-", styles: { halign: 'left' } }],
      ['ยาที่เบิกน้อยสุด:', { content: bottomMeds[0]?.med_name || "-", styles: { halign: 'left' } }],
    ];

    autoTable(doc, {
      startY: 55,
      body: summaryBody,
      theme: 'plain',
      styles: {
        font: "THSarabun",
        fontSize: 14,
        cellPadding: 2,
      },
      columnStyles: {
        0: { fontStyle: 'normal', cellWidth: 80 }, // Label
        1: { cellWidth: 'auto' } // Value
      },
      margin: margin,
      didDrawPage: pageHeaderFooter
    });

    // Top 10 Meds Table
    doc.setFontSize(16);
    doc.text("10 อันดับยาที่เบิกบ่อย 🚀", margin.left, doc.lastAutoTable.finalY + 12);
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["อันดับ", "ชื่อยา", "จำนวนเบิก (ชิ้น)"]],
      body: topMeds.map((med, index) => [index + 1, med.med_name, med.total_withdraw]),
      theme: "grid",
      headStyles: {
        fillColor: [59, 130, 246], 
        font: "THSarabun", fontStyle: "normal", fontSize: 14, halign: 'center'
      },
      bodyStyles: {
        font: "THSarabun", fontStyle: "normal", fontSize: 12
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { halign: 'left' },
        2: { halign: 'right', cellWidth: 40 }
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: margin,
      didDrawPage: pageHeaderFooter
    });

    // Bottom 10 Meds Table
    doc.setFontSize(16);
    doc.text("10 อันดับยาที่เบิกน้อยสุด 📉", margin.left, doc.lastAutoTable.finalY + 12);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 16,
      head: [["อันดับ", "ชื่อยา", "จำนวนเบิก (ชิ้น)"]],
      body: bottomMeds.map((med, index) => [index + 1, med.med_name, med.total_withdraw]),
      theme: "grid",
      headStyles: {
        fillColor: [239, 68, 68],
        font: "THSarabun", fontStyle: "normal", fontSize: 14, halign: 'center'
      },
      bodyStyles: {
        font: "THSarabun", fontStyle: "normal", fontSize: 12
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { halign: 'left' },
        2: { halign: 'right', cellWidth: 40 }
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: margin,
      didDrawPage: pageHeaderFooter
    });

    doc.save(`รายงาน_เบิกยา_${formattedDate}.pdf`);
  };
  // ---------------- End PDF Generator ----------------

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">

      {/* Download PDF Button */}
      <div className="mb-6">
        <button
          onClick={generatePDF}
          className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-lg transition-all"
        >
          ดาวน์โหลดรายงาน PDF
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {summaryCards.map((card, idx) => (
          <motion.div
            key={idx}
            custom={idx}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileHover={{ scale: 1.05, boxShadow: "0 12px 30px rgba(0,0,0,0.15)" }}
            className={`p-5 text-white rounded-2xl shadow-lg flex items-center gap-4 bg-gradient-to-r ${card.bg} cursor-pointer transition-all`}
          >
            <motion.div whileHover={{ rotate: [0, 10, -10, 0], scale: 1.2 }}>
              {card.icon}
            </motion.div>
            <div>
              <p className="text-sm font-light opacity-90">{card.label}</p>
              <p className="text-2xl font-normal truncate">{card.value || 0}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="flex flex-nowrap gap-6 overflow-x-auto pb-4">

        {/* Top 10 Meds */}
        <motion.div
          className="bg-white shadow-xl rounded-2xl p-5 flex-shrink-0"
          style={{ minWidth: 400 }}
          variants={chartVariants} initial="hidden" animate="visible"
        >
          <h3 className="text-lg mb-4 text-gray-800">Top 10 ยาที่เบิกบ่อยเดือนนี้ 🚀</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topMeds} onMouseLeave={() => setHoverIndexTop(null)} margin={{ bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="med_name" angle={-45} textAnchor="end" height={50} interval={0} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} ชิ้น`, "จำนวนเบิก"]} />
              <Bar dataKey="total_withdraw">
                {topMeds.map((entry, index) => (
                  <Cell key={index} fill={index === hoverIndexTop ? "#1e40af" : "#3b82f6"} onMouseEnter={() => setHoverIndexTop(index)} radius={[10, 10, 0, 0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Bottom 10 Meds */}
        <motion.div
          className="bg-white shadow-xl rounded-2xl p-5 flex-shrink-0"
          style={{ minWidth: 400 }}
          variants={chartVariants} initial="hidden" animate="visible"
        >
          <h3 className="text-lg mb-4 text-gray-800">Bottom 10 ยาที่เบิกน้อยสุด 📉</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bottomMeds} onMouseLeave={() => setHoverIndexBottom(null)} margin={{ bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="med_name" angle={-45} textAnchor="end" height={50} interval={0} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} ชิ้น`, "จำนวนเบิก"]} />
              <Bar dataKey="total_withdraw">
                {bottomMeds.map((entry, index) => (
                  <Cell key={index} fill={index === hoverIndexBottom ? "#b91c1c" : "#ef4444"} onMouseEnter={() => setHoverIndexBottom(index)} radius={[10, 10, 0, 0]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Withdraw By Date */}
        <motion.div
          className="bg-white shadow-xl rounded-2xl p-5 flex-shrink-0"
          style={{ minWidth: 400 }}
          variants={chartVariants} initial="hidden" animate="visible"
        >
          <h3 className="text-lg mb-4 text-gray-800">ยอดเบิกรายวัน (เดือนนี้) 📊</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={withdrawByDate} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="wd_date" tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} ชิ้น`, "จำนวนเบิก"]} />
              <Area type="monotone" dataKey="total_withdraw" stroke="none" fill="url(#lineGradient)" animationDuration={2000} />
              <Line
                type="monotone"
                dataKey="total_withdraw"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 5, fill: "#10b981" }}
                activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

      </div>
    </div>
  );
};

export default DashboardStats;
