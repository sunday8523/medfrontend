// File: components/MonthlyWithdrawalsChart.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MonthlyWithdrawalsChart() {
  const [chartData, setChartData] = useState(null);
  const [medOptions, setMedOptions] = useState([]);
  const [selectedMeds, setSelectedMeds] = useState([]);

  // ดึงชื่อยาจาก backend
  useEffect(() => {
    axios.get(`${process.env.VITE_API_URL}/logs/med-names`)
      .then(res => {
        const medsArray = Array.isArray(res.data) ? res.data : [];
        setMedOptions(medsArray.map(name => ({ value: name, label: name })));
      })
      .catch(err => console.error('Error fetching med names:', err));
  }, []);

  // โหลด chart data ตาม filter
  useEffect(() => {
    const med_names = selectedMeds.map(m => m.value).join(',');

    axios.get(`${process.env.VITE_API_URL}/logs/monthly-withdrawals${med_names ? `?med_names=${med_names}` : ''}`)
      .then(res => {
        const data = res.data && typeof res.data === 'object' ? res.data : null;
        setChartData(data);
      })
      .catch(err => {
        console.error('Error fetching chart data:', err);
        setChartData(null);
      });
  }, [selectedMeds]);

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">ปริมาณการเบิกยาในแต่ละเดือน</h2>

      {/* Multi-select filter */}
      <Select
        isMulti
        options={medOptions}
        value={selectedMeds}
        onChange={setSelectedMeds}
        placeholder="กรองตามชื่อยา..."
        className="mb-6"
        classNamePrefix="react-select"
      />

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {chartData ? (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'การเบิกยาตามเดือนในปีนี้',
                  font: { size: 18 },
                  color: '#6B3FA0',
                },
                tooltip: {
                  callbacks: {
                    label: (context) => `จำนวน: ${context.raw} หน่วย`,
                  },
                },
              },
              scales: {
                x: {
                  title: {
                    display: true,
                    text: 'เดือน',
                    font: { size: 14 },
                    color: '#6B3FA0',
                  },
                },
                y: {
                  title: {
                    display: true,
                    text: 'จำนวนการเบิกยา',
                    font: { size: 14 },
                    color: '#6B3FA0',
                  },
                  beginAtZero: true,
                },
              },
            }}
          />
        ) : (
          <p>กำลังโหลดข้อมูล...</p>
        )}
      </div>
    </div>
  );
}
