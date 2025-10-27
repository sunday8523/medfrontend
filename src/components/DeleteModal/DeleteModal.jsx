import React from "react";
import "./DeleteModal.css";

function DeleteModal({ isOpen, onClose, onDelete, message }) {
  if (!isOpen) return null; // ไม่แสดง modal ถ้า isOpen=false

  return (
    <div className="modal-overlay">
      <div className="card">
        <div className="card-content">
          <p className="card-heading">ลบรายการหรือไม่?</p>
          <p className="card-description">{message || "คุณแน่ใจหรือไม่ที่จะลบรายการนี้?"}</p>
        </div>
        <div className="card-button-wrapper">
          <button className="card-button secondary" onClick={onClose}>ยกเลิก</button>
          <button className="card-button primary" onClick={onDelete}>ลบ</button>
        </div>
        <button className="exit-button" onClick={onClose}>
          <svg height="20px" viewBox="0 0 384 512">
            <path
              d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default DeleteModal;
