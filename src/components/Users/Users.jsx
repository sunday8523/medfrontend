import React, { useState, useContext } from "react";
import UsersTable from "../UsersTable/UsersTable.jsx";
import RegisterModal from "../../pages/Register/RegisterModal.jsx";
import { ToastContainer } from "react-toastify";
import { UserContext } from "../../context/UserContext.jsx";
import "react-toastify/dist/ReactToastify.css";
import "./Users.css";

function Users() {
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const { user } = useContext(UserContext); // ✅ ดึงข้อมูล user จาก context

  const handleToggle = () => setShowRegisterModal(!showRegisterModal);

  return (
    <div className="user-container">
      <div className="button-container">
        {/* ✅ แสดงปุ่มเฉพาะ admin */}
        {user?.role === "admin" && (
          <button className="toggle-button add-button" onClick={handleToggle}>
            เพิ่มสมาชิก
          </button>
        )}
      </div>

      <div className="users-table-section">
        <UsersTable />
      </div>

      {/* ✅ ป็อปอัพสมัครสมาชิกเฉพาะ admin */}
      {user?.role === "admin" && showRegisterModal && (
        <RegisterModal closeModal={handleToggle} />
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default Users;
