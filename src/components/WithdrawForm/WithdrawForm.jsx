import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';
import './WithdrawForm.css';
import { format } from 'date-fns';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

function WithdrawForm({ selectedMed, onCancel }) {
  const { user } = useContext(UserContext);

  const [form, setForm] = useState({
    med_id: selectedMed?.med_id || '',
    med_name: selectedMed?.med_name || '',
    amount: '',
    wd_date: format(new Date(), 'yyyy-MM-dd'),
    recip: '',
    note: ''
  });

  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState({ message: '', type: '' });

  useEffect(() => {
    if (selectedMed) {
      setForm(prevForm => ({
        ...prevForm,
        med_id: selectedMed.med_id,
        med_name: selectedMed.med_name,
      }));
    }
  }, [selectedMed]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Validation real-time
    setErrors(prev => ({
      ...prev,
      [name]: value.trim() === '' && ['amount','wd_date','recip'].includes(name)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ตรวจสอบฟิลด์จำเป็น
    const newErrors = {
      amount: !form.amount,
      wd_date: !form.wd_date,
      recip: !form.recip
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some(v => v)) {
      setNotification({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน', type: 'error' });
      return;
    }

    if (parseInt(form.amount) <= 0 || parseInt(form.amount) > selectedMed.amount) {
      setNotification({ message: `จำนวนที่เบิกต้องมากกว่า 0 และไม่เกิน ${selectedMed.amount}`, type: 'error' });
      return;
    }

    try {
      const payload = {
        med_id: form.med_id,
        med_name: form.med_name,
        amount: parseInt(form.amount, 10),
        wd_date: form.wd_date,
        action: 'withdraw',
        name: user?.name || 'ไม่ระบุ',
        recip: form.recip,
        note: form.note,
      };

      await apiClient.post('/logs/withdraw', payload);
      setNotification({ message: 'บันทึกข้อมูลการเบิกยาเรียบร้อยแล้ว', type: 'success' });

      setTimeout(() => {
        onCancel();
      }, 1500);
    } catch (error) {
      setNotification({ message: 'เกิดข้อผิดพลาด: ' + (error.response?.data?.message || error.message), type: 'error' });
      console.error("Error submitting form:", error);
    }
  };

  return (
    <div className="withdraw-modal-overlay">
      <div className="withdraw-content-wrapper">
        <h2 className="modal-header">ฟอร์มเบิกยา</h2>

        <form className="withdraw-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label>ไอดีและชื่อยา:</label>
            <input
              className="withdraw-field"
              type="text"
              value={`${form.med_id} - ${form.med_name}`}
              readOnly
              disabled
            />
          </div>

          <div className="field-group">
            <label>
              จำนวนที่เบิก: <span className="required-star">{errors.amount ? '*' : ''}</span>
            </label>
            <input
              className="withdraw-field"
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              min="1"
            />
          </div>

          <div className="field-group">
            <label>
              วันที่เบิก: <span className="required-star">{errors.wd_date ? '*' : ''}</span>
            </label>
            <input
              className="withdraw-field"
              type="date"
              name="wd_date"
              value={form.wd_date}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <label>
              ผู้รับยา: <span className="required-star">{errors.recip ? '*' : ''}</span>
            </label>
            <input
              className="withdraw-field"
              type="text"
              name="recip"
              value={form.recip}
              onChange={handleChange}
            />
          </div>

          <div className="field-group">
            <label>หมายเหตุ:</label>
            <textarea
              className="withdraw-field"
              name="note"
              value={form.note}
              onChange={handleChange}
            />
          </div>

          <div className="button-group">
            <button type="submit" className="withdraw-btn">ยืนยัน</button>
            <button type="button" onClick={onCancel} className="withdraw-btn cancel">ยกเลิก</button>
          </div>
        </form>

        {notification.message && (
          <div className={`notification-toast ${notification.type}`}>
            {notification.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default WithdrawForm;
