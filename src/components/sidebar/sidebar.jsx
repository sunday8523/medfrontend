// src/components/sidebar/sidebar.jsx
import React from 'react';
import './sidebar.css';

const Sidebar = ({ onMenuClick, onLogout, activeMenu }) => (
  <div className="sidebar">
    <ul className="menu">
      {[
        { key: 'dashboard', icon: 'fa-solid fa-chart-simple', text: 'Dashboard' },
        { key: 'med-data', icon: 'fa-solid fa-list-check', text: 'คลังหลัก' },
        { key: 'sec-med', icon: 'fa-solid fa-list-check', text: 'คลังเตรียมเบิกจ่าย' },
        { key: 'members', icon: 'fa-solid fa-address-book', text: 'สมาชิก' },
        { key: 'log', icon: 'fas fa-question-circle', text: 'log' }
      ].map(item => (
        <li
          key={item.key}
          className={activeMenu === item.key ? 'active' : ''}
          onClick={() => onMenuClick(item.key)}
        >
          <i className={item.icon}></i>
          <span className="sidebar-text">{item.text}</span>
        </li>
      ))}
    </ul>

    {/* Logout อยู่ด้านล่าง */}
    <ul className="menu logout-menu">
      <li className="logout" onClick={onLogout}>
        <i className="fas fa-sign-out-alt"></i>
        <span className="sidebar-text">Logout</span>
      </li>
    </ul>
  </div>
);

export default Sidebar;
