import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ApiKeys } from './pages/ApiKeys';
import { Users } from './pages/Users';
import { Monitoring } from './pages/Monitoring';
import { Simulator } from './pages/Simulator';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Protected Routes wrapped in DashboardLayout */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="keys" element={<ApiKeys />} />
        <Route path="users" element={<Users />} />
        <Route path="monitoring" element={<Monitoring />} />
        <Route path="simulator" element={<Simulator />} />
      </Route>
    </Routes>
  );
}

export default App;
