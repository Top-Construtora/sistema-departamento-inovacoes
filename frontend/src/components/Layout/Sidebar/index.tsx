import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  Headphones,
  Key,
  Palette,
  LogOut,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Home,
  MessageSquare,
} from 'lucide-react';
import { useAuth } from '../../../contexts';
import { PerfilUsuario } from '../../../types';
import styles from './styles.module.css';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

function formatPerfil(perfil: string): string {
  const perfilMap: Record<string, string> = {
    LIDER: 'Lider',
    ANALISTA: 'Analista',
    EXTERNO: 'Usuario Externo',
  };
  return perfilMap[perfil] || perfil;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { usuario, logout } = useAuth();

  const isInterno = usuario?.perfil === PerfilUsuario.LIDER || usuario?.perfil === PerfilUsuario.ANALISTA;
  const isLider = usuario?.perfil === PerfilUsuario.LIDER;

  const menuItems = isInterno
    ? [
        { path: '/', icon: Home, label: 'Início' },
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/projetos', icon: FolderKanban, label: 'Projetos' },
        { path: '/demandas', icon: ClipboardList, label: 'Demandas' },
        { path: '/chamados', icon: Headphones, label: 'Chamados' },
        { path: '/notas', icon: MessageSquare, label: 'Notas' },
        { path: '/portfolio', icon: Briefcase, label: 'Portfolio' },
        { path: '/sistemas-acesso', icon: Key, label: 'Sistemas de Acesso' },
        { path: '/identidade-visual', icon: Palette, label: 'Identidade Visual' },
        ...(isLider ? [{ path: '/usuarios', icon: Users, label: 'Usuários' }] : []),
      ]
    : [
        { path: '/', icon: Home, label: 'Início' },
        { path: '/chamados', icon: Headphones, label: 'Meus Chamados' },
      ];

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      {/* Header com Logo */}
      <div className={styles.header}>
        <Link to="/" className={styles.logoLink}>
          <div className={styles.logoIcon}>
            <img src="/images/logo.png" alt="GIO" />
          </div>
          {!collapsed && (
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>Inovações</span>
              <span className={styles.logoSubtitle}>& Tecnologia</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navegacao */}
      <nav className={styles.nav}>
        <div className={styles.navSection}>
          {!collapsed && <p className={styles.navSectionTitle}>Menu Principal</p>}
          {menuItems.slice(0, 7).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className={styles.navIcon} />
              {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </div>

        {isInterno && menuItems.length > 7 && (
          <>
            <div className={styles.divider} />
            <div className={styles.navSection}>
              {!collapsed && <p className={styles.navSectionTitle}>Configurações</p>}
              {menuItems.slice(7).map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ''}`
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon className={styles.navIcon} />
                  {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* Toggle Button */}
      <button
        className={styles.toggleButton}
        onClick={onToggle}
        title={collapsed ? 'Expandir menu' : 'Recolher menu'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        {!collapsed && <span className={styles.toggleLabel}>Recolher</span>}
      </button>

      {/* Footer com Usuario */}
      <div className={styles.footer}>
        <div className={`${styles.userCard} ${collapsed ? styles.userCardCollapsed : ''}`}>
          <div className={styles.userAvatar}>
            {usuario?.nome.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {usuario?.nome.split(' ').slice(0, 2).join(' ')}
              </span>
              <span className={styles.userRole}>
                {formatPerfil(usuario?.perfil || '')}
              </span>
            </div>
          )}
          <button
            className={styles.logoutButton}
            onClick={logout}
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
}
