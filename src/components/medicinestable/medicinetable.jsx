import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './medicinetable.css';
import { UserContext } from '../../context/UserContext';
import { format } from 'date-fns';
import { QRCodeCanvas } from 'qrcode.react';

const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function MedicinesTable() {
  const { user } = useContext(UserContext);
  const [meds, setMeds] = useState([]);
  const [selectedMed, setSelectedMed] = useState(null);
  const [editingData, setEditingData] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Pagination
  const rowsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);
  const [animatePage, setAnimatePage] = useState(false);

  useEffect(() => {
    fetchMeds();
  }, []);

  const fetchMeds = async () => {
    try {
      const res = await apiClient.get('/meds');
      setMeds(res.data);
    } catch {
      showNotification('เกิดข้อผิดพลาดในการดึงข้อมูล', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const confirmAction = (title, desc, onConfirm, type = 'default') => {
    setConfirmModal({ title, desc, onConfirm, type });
  };

  const handleDelete = (id) => {
    confirmAction(
      'ลบข้อมูลยา',
      'คุณแน่ใจหรือไม่ว่าต้องการลบยานี้?',
      async () => {
        await apiClient.delete(`/meds/${id}`);
        setMeds(prev => prev.filter(m => m.med_id !== id));
        setSelectedMed(null);
        showNotification('ลบข้อมูลสำเร็จ', 'error');
        setConfirmModal(null);
      },
      'delete'
    );
  };

  const handleConfirmEdit = () => {
    confirmAction(
      'ยืนยันการแก้ไข',
      'คุณต้องการบันทึกการแก้ไขข้อมูลยานี้หรือไม่?',
      async () => {
        await apiClient.put(`/meds/${selectedMed.med_id}`, editingData);
        setMeds(prev => prev.map(m => m.med_id === selectedMed.med_id ? { ...m, ...editingData } : m));
        setSelectedMed(prev => ({ ...prev, ...editingData }));
        setEditingData(null);
        showNotification('แก้ไขข้อมูลสำเร็จ', 'success');
        setConfirmModal(null);
      },
      'edit'
    );
  };

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount, 10);
    if (isNaN(amount) || amount <= 0 || amount > selectedMed.amount) {
      showNotification('จำนวนเบิกไม่ถูกต้อง', 'error');
      return;
    }

    confirmAction(
      'ยืนยันการเบิกยา',
      `คุณต้องการเบิกยา ${amount} ชิ้นใช่หรือไม่?`,
      async () => {
        try {
          await apiClient.post('/withdraw', {
            med_id: selectedMed.med_id,
            med_name: selectedMed.med_name,
            amount,
            type: selectedMed.type,
            expire: selectedMed.expire,
            lotno: selectedMed.lotno
          });

          const updatedMeds = meds.map(m =>
            m.med_id === selectedMed.med_id ? { ...m, amount: m.amount - amount } : m
          ).filter(m => m.amount > 0); // Auto delete if amount=0

          setMeds(updatedMeds);
          setSelectedMed(prev => ({ ...prev, amount: prev.amount - amount }));
          setWithdrawAmount('');
          showNotification(`เบิกยา ${amount} ชิ้นสำเร็จ`, 'success');
          setConfirmModal(null);
        } catch (err) {
          if (err.response?.status === 401) {
            showNotification('ไม่ได้รับอนุญาต กรุณาเข้าสู่ระบบใหม่', 'error');
          } else {
            showNotification('เกิดข้อผิดพลาดในการเบิกยา', 'error');
          }
        }
      },
      'withdraw'
    );
  };

  const formatDate = (date) =>
    date ? format(new Date(date), 'dd/MM/yyyy') : 'N/A';

  const handleDownloadQR = () => {
    const canvas = document.getElementById('med-qrcode');
    if (canvas) {
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      let downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `qrcode-med-${selectedMed.med_id}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(meds.length / rowsPerPage);
  const paginatedMeds = meds.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (page) => {
    if (page === currentPage) return;
    setAnimatePage(true);
    setTimeout(() => {
      setCurrentPage(page);
      setAnimatePage(false);
    }, 250);
  };

  return (
    <div className="medicines-table-container">
      <h2>คลังหลัก</h2>
      <table className="medicines-table">
        <thead>
          <tr>
            <th>ไอดี</th>
            <th>ชื่อยา</th>
            <th>จำนวน</th>
            <th>ประเภท</th>
            <th>Lot No</th>
            <th>วันหมดอายุ</th>
          </tr>
        </thead>
        <tbody className={animatePage ? 'fade-slide' : ''}>
          {paginatedMeds.length ? (
            paginatedMeds.map((med) => (
              <tr key={med.med_id} onClick={() => setSelectedMed(med)}>
                <td data-label="ไอดี">{med.med_id}</td>
                <td data-label="ชื่อยา">{med.med_name}</td>
                <td data-label="จำนวน">{med.amount}</td>
                <td data-label="ประเภท">{med.type}</td>
                <td data-label="Lot No">{med.lotno}</td>
                <td data-label="วันหมดอายุ">{formatDate(med.expire)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center' }}>
                ไม่มีข้อมูล
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            ◀
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
              onClick={() => handlePageChange(i + 1)}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            ▶
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedMed && (
        <div
          className="modal-overlay"
          onClick={() => {
            setSelectedMed(null);
            setEditingData(null);
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-modal"
              onClick={() => {
                setSelectedMed(null);
                setEditingData(null);
              }}
            >
              ×
            </button>
            <h3>ข้อมูลยา ID: {selectedMed.med_id}</h3>

            {editingData ? (
              <>
                <input
                  type="text"
                  value={editingData.med_name}
                  onChange={(e) =>
                    setEditingData({ ...editingData, med_name: e.target.value })
                  }
                  placeholder="ชื่อยา"
                />
                <input
                  type="number"
                  value={editingData.amount}
                  onChange={(e) =>
                    setEditingData({ ...editingData, amount: e.target.value })
                  }
                  placeholder="จำนวน"
                />
                <input
                  type="text"
                  value={editingData.type}
                  onChange={(e) =>
                    setEditingData({ ...editingData, type: e.target.value })
                  }
                  placeholder="ประเภท"
                />
                <input
                  type="text"
                  value={editingData.lotno || ''}
                  onChange={(e) =>
                    setEditingData({ ...editingData, lotno: e.target.value })
                  }
                  placeholder="Lot No"
                />
                <input
                  type="date"
                  value={editingData.expire}
                  onChange={(e) =>
                    setEditingData({ ...editingData, expire: e.target.value })
                  }
                />
                <div className="modal-actions">
                  <button className="btn-edit" onClick={handleConfirmEdit}>
                    ยืนยันแก้ไข
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={() => setEditingData(null)}
                  >
                    ยกเลิก
                  </button>
                </div>
              </>
            ) : (
              <>
                <p><strong>ชื่อยา:</strong> {selectedMed.med_name}</p>
                <p><strong>จำนวน:</strong> {selectedMed.amount}</p>
                <p><strong>ประเภท:</strong> {selectedMed.type}</p>
                <p><strong>Lot No:</strong> {selectedMed.lotno}</p>
                <p><strong>วันหมดอายุ:</strong> {formatDate(selectedMed.expire)}</p>

                <div className="qr-code-container">
                  <QRCodeCanvas
                    id="med-qrcode"
                    value={`ID: ${selectedMed.med_id}\nชื่อยา: ${selectedMed.med_name}\nจำนวน: ${selectedMed.amount}\nประเภท: ${selectedMed.type}\nLot: ${selectedMed.lotno}\nวันหมดอายุ: ${formatDate(selectedMed.expire)}`}
                    size={180}
                    bgColor={"#ffffff"}
                    fgColor={"#000000"}
                    level={"M"}
                    includeMargin={true}
                  />
                  <button className="btn-download-qr" onClick={handleDownloadQR}>
                    ดาวน์โหลด QR Code
                  </button>
                </div>

                <div className="modal-actions">
                  <button
                    className="btn-edit"
                    onClick={() =>
                      setEditingData({
                        med_name: selectedMed.med_name,
                        amount: selectedMed.amount,
                        type: selectedMed.type,
                        expire: selectedMed.expire
                          ? format(new Date(selectedMed.expire), 'yyyy-MM-dd')
                          : '',
                        lotno: selectedMed.lotno
                      })
                    }
                  >
                    แก้ไข
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(selectedMed.med_id)}
                  >
                    ลบ
                  </button>
                </div>

                <div className="withdraw-section">
                  <label>จำนวนเบิก:</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="กรอกจำนวน"
                  />
                  <button className="btn-withdraw" onClick={handleWithdraw}>
                    เบิกยา
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="modal-overlay">
          <div className="card">
            <div className="card-content">
              <p className="card-heading">{confirmModal.title}</p>
              <p className="card-description">{confirmModal.desc}</p>
            </div>
            <div className="card-button-wrapper">
              <button
                className="card-button secondary"
                onClick={() => setConfirmModal(null)}
              >
                ยกเลิก
              </button>
              <button
                className={`card-button ${confirmModal.type === 'edit' ? 'btn-edit' :
                  confirmModal.type === 'withdraw' ? 'btn-withdraw' :
                    confirmModal.type === 'delete' ? 'btn-delete' :
                      'primary'
                  }`}
                onClick={confirmModal.onConfirm}
              >
                ยืนยัน
              </button>
            </div>
            <button
              className="exit-button"
              onClick={() => setConfirmModal(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {notification && (
        <div className={`toast ${notification.type}`}>
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default MedicinesTable;
