import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppLayout = () => (
  <div style={{ display:'flex', minHeight:'100vh' }}>
    <Sidebar />
    <main style={{ flex:1, overflowY:'auto', overflowX:'hidden' }}>
      <Outlet />
    </main>
  </div>
);
export default AppLayout;
