import { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { Sidebar } from './Sidebar';
import styles from './styles.module.css';

export function Layout() {
  const { isAuthenticated, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  function toggleSidebar() {
    setCollapsed((prev) => !prev);
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className={styles.container}>
      <Sidebar collapsed={collapsed} onToggle={toggleSidebar} />
      <main className={`${styles.main} ${collapsed ? styles.mainCollapsed : ''}`}>
        <Outlet />
      </main>
    </div>
  );
}
