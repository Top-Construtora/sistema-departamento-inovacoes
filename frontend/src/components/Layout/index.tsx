import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { Sidebar } from './Sidebar';
import styles from './styles.module.css';

export function Layout() {
  const { isAuthenticated, loading } = useAuth();

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
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
