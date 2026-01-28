import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import DeleteModal from '../DeleteModal/DeleteModal.jsx';
import Toast from '../Toast/Toast.jsx';
import './LogTable.css'; // อย่าลืม import CSS ที่เราแก้ไขกันไป

function LogTable() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Toast state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 6; // กำหนดให้แสดง 6 แถวต่อหน้า

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
  };

  const handleCloseToast = () => {
    setToast({ visible: false, message: '', type: 'success' });
  };

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/logs`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setLogs(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching logs:", err);
        setError("ไม่สามารถดึงข้อมูล logs ได้ กรุณาลองใหม่อีกครั้ง");
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const handleDeleteClick = (log) => {
    setSelectedLog(log);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedLog) return;

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/logs/${selectedLog.log_id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const newLogs = logs.filter(log => log.log_id !== selectedLog.log_id);
      setLogs(newLogs);

      // --- Pagination edge case handling ---
      // ตรวจสอบว่าหน้าปัจจุบันจะว่างเปล่าหรือไม่หลังจากลบ
      const newTotalPages = Math.ceil(newLogs.length / logsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        // ถ้าหน้าปัจจุบันมากกว่าจำนวนหน้าใหม่ (เช่น ลบไอเท็มสุดท้ายของหน้าสุดท้าย)
        // ให้ย้ายไปหน้าที่เป็นหน้าสุดท้ายใหม่
        setCurrentPage(newTotalPages);
      } else if (currentPage > 1 && newLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage).length === 0) {
        // อีกเคส: ถ้าลบจนหน้าปัจจุบัน (ที่ไม่ใช่หน้า 1) ว่าง
        setCurrentPage(prev => prev - 1);
      }
      // --- End Pagination handling ---

      setModalOpen(false);
      setSelectedLog(null);
      showToast('ลบข้อมูลสำเร็จ', 'success'); // toast success
    } catch (err) {
      console.error("Error deleting log:", err);
      setModalOpen(false);
      setSelectedLog(null);
      showToast('ไม่สามารถลบข้อมูลได้ กรุณาลองใหม่อีกครั้ง', 'error'); // toast error
    }
  };

  if (loading) return <div className="loading-message">กำลังโหลดข้อมูล...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (logs.length === 0) return <div className="no-data-message">ไม่พบข้อมูล logs ในระบบ</div>;

  // --- Pagination Logic ---
  const totalLogs = logs.length;
  const totalPages = Math.ceil(totalLogs / logsPerPage);

  // คำนวณ logs ที่จะแสดงในหน้าปัจจุบัน
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);

  // ฟังก์ชันสำหรับเปลี่ยนหน้า
  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages)); // ไม่ให้เกินหน้าสุดท้าย
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1)); // ไม่ให้น้อยกว่าหน้า 1
  };
  // --- End Pagination Logic ---


  return (
    <div className="log-table-container">
      <h2>ข้อมูล Logs การเบิกยา</h2>
      <div className="table-responsive">
        <table className="log-table">
          <thead>
            <tr>
              <th>ID ยา</th>
              <th>ชื่อยา</th>
              <th>Lot No</th>
              <th>จำนวน</th>
              <th>วันที่ดำเนินการ</th>
              <th>การกระทำ</th>
              <th>ผู้ดำเนินการ</th>
              <th>ผู้รับยา</th>
              <th>หมายเหตุ</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {currentLogs.map(log => ( // map จาก currentLogs ที่แบ่งหน้าแล้ว
              <tr key={log.log_id}>
                <td data-label="ID ยา">{log.med_id}</td>
                <td data-label="ชื่อยา">{log.med_name}</td>
                <td data-label="Lot No">{log.lotno}</td>
                <td data-label="จำนวน">{log.amount}</td>
                <td data-label="วันที่ดำเนินการ">{format(new Date(log.wd_date), 'dd/MM/yyyy')}</td>
                <td data-label="การกระทำ">{log.action}</td>
                <td data-label="ผู้ดำเนินการ">{log.name}</td>
                <td data-label="ผู้รับยา">{log.recip}</td>
                <td data-label="หมายเหตุ">{log.note}</td>
                <td data-label="การจัดการ">
                  <button
                    onClick={() => handleDeleteClick(log)}
                    className="delete-button"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Pagination Controls (Minimalist Version) --- */}
      <div className="pagination-controls">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
        >
          &lt;
        </button>
        <span>
          หน้า {currentPage} / {totalPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          &gt;
        </button>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedLog(null); }}
        onDelete={handleDeleteConfirm}
        message={selectedLog ? `คุณแน่ใจหรือไม่ที่จะลบ ${selectedLog.med_name}?` : ''}
      />

      {/* Toast Notification */}
      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}
    </div>
  );
}

export default LogTable;