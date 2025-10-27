// src/components/UsersTable/UsersTable.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../context/UserContext.jsx";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ConfirmModal from "../ConfirmModal/ConfirmModal.jsx";
import "./userstable.css";

function UsersTable() {
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    name: "",
    role: "",
  });
  const [modal, setModal] = useState({ show: false, type: "", userId: null });

  const { user } = useContext(UserContext);
  const token = localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteClick = (id) => setModal({ show: true, type: "delete", userId: id });
  const handleConfirmDelete = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${modal.userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("ลบผู้ใช้เรียบร้อยแล้ว");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("เกิดข้อผิดพลาดในการลบผู้ใช้");
    }
    setModal({ show: false, type: "", userId: null });
  };

  const handleEdit = (u) => {
    setEditingId(u.id);
    setEditData({ username: u.username, email: u.email, name: u.name, role: u.role });
  };

  const handleEditClick = (id) => setModal({ show: true, type: "edit", userId: id });

  const handleConfirmEdit = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/${modal.userId}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("แก้ไขข้อมูลผู้ใช้เรียบร้อยแล้ว");
      fetchUsers();
      setEditingId(null);
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("เกิดข้อผิดพลาดในการแก้ไขข้อมูลผู้ใช้");
    }
    setModal({ show: false, type: "", userId: null });
  };

  const handleCancelModal = () => { setModal({ show: false, type: "", userId: null }); setEditingId(null); };
  const handleChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });

  return (
    <div className="users-table-container">
      <ToastContainer position="bottom-right" autoClose={2000} />
      <h2>ตารางข้อมูลผู้ใช้</h2>
      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>ชื่อสมาชิก</th>
            {user?.role === "admin" && <th>ชื่อผู้ใช้</th>}
            {user?.role === "admin" && <th>อีเมล</th>}
            {user?.role === "admin" && <th>Role</th>}
            {user?.role === "admin" && <th>การกระทำ</th>}
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? users.map((u) => (
            <tr key={u.id} className={editingId === u.id ? "editing" : ""}>
              <td>{u.id}</td>
              <td>{u.name}</td>
              {user?.role === "admin" && <>
                <td>{editingId === u.id ? <input name="username" value={editData.username} onChange={handleChange} /> : u.username}</td>
                <td>{editingId === u.id ? <input name="email" value={editData.email} onChange={handleChange} /> : u.email}</td>
                <td>{editingId === u.id ? <select name="role" value={editData.role} onChange={handleChange}><option value="admin">Admin</option><option value="member">Member</option></select> : u.role}</td>
                <td className="action-buttons">
                  {editingId === u.id ? <>
                    <button className="confirm" onClick={() => handleEditClick(u.id)}>ยืนยัน</button>
                    <button className="cancel" onClick={handleCancelModal}>ยกเลิก</button>
                  </> : <>
                    <button className="edit" onClick={() => handleEdit(u)}>แก้ไข</button>
                    <button className="cancel" onClick={() => handleDeleteClick(u.id)}>ลบ</button>
                  </>}
                </td>
              </>}
            </tr>
          )) : <tr><td colSpan={user?.role === "admin" ? 6 : 2} style={{ textAlign: "center" }}>ไม่พบข้อมูลผู้ใช้</td></tr>}
        </tbody>
      </table>

      {modal.show && modal.type === "delete" && <ConfirmModal title="ยืนยันการลบผู้ใช้" description="คุณแน่ใจว่าต้องการลบผู้ใช้นี้หรือไม่" onConfirm={handleConfirmDelete} onCancel={handleCancelModal} />}
      {modal.show && modal.type === "edit" && <ConfirmModal title="ยืนยันการแก้ไขข้อมูลผู้ใช้" description="คุณแน่ใจว่าต้องการบันทึกการแก้ไขนี้หรือไม่" onConfirm={handleConfirmEdit} onCancel={handleCancelModal} />}
    </div>
  );
}

export default UsersTable;
