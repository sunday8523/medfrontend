// src/components/ConfirmModal/ConfirmModal.jsx
import React from "react";
import './confirmmodal.css';

function ConfirmModal({ title, description, onConfirm, onCancel }) {
    return (
        <div className="modal-overlay">
            <div className="card">
                <div className="card-content">
                    <p className="card-heading">{title}</p>
                    <p className="card-description">{description}</p>
                </div>
                <div className="card-button-wrapper">
                    <button className="card-button secondary" onClick={onCancel}>Cancel</button>
                    <button className="card-button primary" onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
