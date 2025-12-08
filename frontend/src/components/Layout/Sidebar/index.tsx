import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Headphones,
  Key,
  Palette,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../../contexts';
import { PerfilUsuario } from '../../../types';
import styles from './styles.module.css';

export function Sidebar() {
  const { usuario, logout } = useAuth();

  const isInterno = usuario?.perfil === PerfilUsuario.LIDER || usuario?.perfil === PerfilUsuario.ANALISTA;

  const menuItems = isInterno
    ? [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/projetos', icon: FolderKanban, label: 'Projetos' },
        { path: '/demandas', icon: ClipboardList, label: 'Demandas' },
        { path: '/chamados', icon: Headphones, label: 'Chamados' },
        { path: '/sistemas-acesso', icon: Key, label: 'Acessos' },
        { path: '/identidade-visual', icon: Palette, label: 'Identidade' },
      ]
    : [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/chamados', icon: Headphones, label: 'Meus Chamados' },
      ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <h1>Inovacoes</h1>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.user}>
          <div className={styles.userAvatar}>
            {usuario?.nome.charAt(0).toUpperCase()}
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{usuario?.nome}</span>
            <span className={styles.userRole}>{usuario?.perfil}</span>
          </div>
        </div>
        <button className={styles.logoutButton} onClick={logout}>
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
