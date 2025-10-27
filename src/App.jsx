import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login.jsx';
import Home from './pages/Home/Home.jsx';
import Register from './pages/Register/Register.jsx';
import PrivateRoute from './PrivateRoute.jsx';
import ToastProvider from './components/ToastProvider.jsx'; // 👈 import มาใช้

function App() {
  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<Login />} />
        <Route path='/login' element={<Login />} />
        <Route 
          path='/register' 
          element={
            <PrivateRoute>
              <Register />
            </PrivateRoute>
          } 
        />
        <Route 
          path='/home' 
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } 
        />
      </Routes>

     
      <ToastProvider />
    </div>
  );
}

export default App;
