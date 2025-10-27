import React, { useState } from 'react';
import SecMedTable from '../sec_med_table/sec_med_table.jsx';
import WithdrawForm from '../WithdrawForm/WithdrawForm.jsx';
import './sec_med.css';

function SecMed() {
  const [selectedMed, setSelectedMed] = useState(null);

  const handleWithdrawClick = (med) => {
    // เมื่อมีการคลิกปุ่มเบิกยา ให้กำหนดค่า selectedMed
    setSelectedMed(med);
  };
  
  const handleCancel = () => {
    // เมื่อยกเลิกฟอร์ม ให้กำหนดค่า selectedMed เป็น null เพื่อซ่อนฟอร์ม
    setSelectedMed(null);
  };

  return (
    <div className="dashboard-container">
      {/* ✅ ให้แสดงตาราง SecMedTable เสมอ
        ✅ และถ้ามี selectedMed ก็ให้แสดง WithdrawForm ทับขึ้นมา
      */}
      <SecMedTable onWithdrawClick={handleWithdrawClick} />
      {selectedMed && (
        <WithdrawForm selectedMed={selectedMed} onCancel={handleCancel} />
      )}
    </div>
  );
}

export default SecMed;
