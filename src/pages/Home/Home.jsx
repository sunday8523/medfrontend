import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from "../../components/sidebar/sidebar";
import MedData from '../../components/med_data/med_data';
import Dashboard from '../../components/Dashboard/Dashboard';
import Users from '../../components/Users/Users';
import SecMed from '../../components/sec_med/sec_med';
import LogTable from '../../components/LogTable/LogTable.jsx';
import { UserContext } from '../../context/UserContext';

import { FaUserCircle, FaCog } from "react-icons/fa";
import UserSettingsModal from '../../components/UserSettingsModal/UserSettingsModal';

import './home.css';

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);
  const [showContent, setShowContent] = useState('dashboard');
  const [showAddMed, setShowAddMed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const userInfoRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // เปิด modal แทน navigate
  const handleSetting = () => {
    setDropdownOpen(false);
    setModalOpen(true);
  };

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userInfoRef.current && !userInfoRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="app-container">
      <Sidebar
        activeMenu={showContent}
        onMenuClick={menu => {
          if (menu === 'sec-med') setShowAddMed(true);
          else setShowAddMed(false);
          setShowContent(menu);
        }}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <div className="header--wrapper">
          {user && (
            <div
              className="user-info"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              ref={userInfoRef}
            >
              <FaUserCircle className="user-icon" />
              <span className="user-name">{user.name}</span>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={handleSetting}>
                    <FaCog className="dropdown-icon" /> Setting
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card--container">
          {showContent === 'dashboard' && <Dashboard />}
          {showContent === 'med-data' && <MedData showAddMed={showAddMed} />}
          {showContent === 'members' && <Users />}
          {showContent === 'sec-med' && <SecMed />}
          {showContent === 'log' && <LogTable />}
        </div>

        {/* Modal */}
        <UserSettingsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </main>
    </div>
  );
};

export default Home;
