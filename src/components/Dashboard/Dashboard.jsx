
import React from 'react';
import './Dashboard.css';
import Quantity from '../Dashboard/dashboard_chart/quantity.jsx';
import MonthlyWithdrawalsChart from '../Dashboard/MonthlyWithdrawalsChart/MonthlyWithdrawalsChart.jsx';
import ExpirationTable from '../ExpirationTable/ExpirationTable.jsx';
import DashboardStats from '../DashboardStats/DashboardStats.jsx';

/**
 * คอมโพเนนต์ Dashboard ทำหน้าที่เป็นหน้าหลักของแดชบอร์ด
 * แสดงข้อมูลสรุปและคอมโพเนนต์ย่อยอื่นๆ เช่น UserTable
 */
const Dashboard = () => {
  return (
    <div className="min-h-screen bg-purple-50 p-6">
      <h1 className="text-3xl font-bold mb-8 text-purple-700">Dashboard</h1>

      <div className="flex flex-col space-y-0"> {/* ใช้ flex-col เพื่อจัดเรียงคอมโพเนนต์ในแนวตั้ง */}
        <Quantity />
        <ExpirationTable />
        <DashboardStats />
        <MonthlyWithdrawalsChart />
      </div>
    </div>
    
  );
};

export default Dashboard;