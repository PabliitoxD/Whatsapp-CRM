'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Send, 
  Settings, 
  MessageSquare,
  LogOut,
  Zap
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Contatos', icon: <Users size={20} />, path: '/contacts' },
    { name: 'Campanhas', icon: <Send size={20} />, path: '/campaigns' },
    { name: 'Mensagens', icon: <MessageSquare size={20} />, path: '/messages' },
    { name: 'Configurações', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <aside className="sidebar glass">
      <div className="sidebar-logo">
        <Zap className="logo-icon" fill="currentColor" />
        <span className="gradient-text">CRM Master</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div className={`nav-item ${isActive ? 'active' : ''}`}>
                {item.icon}
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="nav-item logout">
          <LogOut size={20} />
          <span>Sair</span>
        </div>
      </div>

      <style jsx>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          padding: 1.5rem;
          border-radius: 0;
          border-left: none;
          border-top: none;
          border-bottom: none;
          z-index: 100;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 0.5rem;
          margin-bottom: 2rem;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .logo-icon {
          color: var(--primary);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1rem;
          border-radius: 12px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
          transition: var(--transition);
        }

        .nav-item:hover {
          background: var(--glass-hover);
          color: white;
        }

        .nav-item.active {
          background: var(--primary);
          color: white;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid var(--glass-border);
        }

        .logout:hover {
          color: var(--error);
          background: rgba(239, 68, 68, 0.1);
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
