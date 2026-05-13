'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Send, 
  Settings as SettingsIcon,
  LogOut,
  Zap
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Contatos', icon: <Users size={20} />, path: '/contacts' },
    { name: 'Modelos', icon: <MessageSquare size={20} />, path: '/templates' },
    { name: 'Campanhas', icon: <Send size={20} />, path: '/campaigns' },
    { name: 'Configurações', icon: <SettingsIcon size={20} />, path: '/settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', padding: '0 0.5rem' }}>
        <Zap size={28} style={{ color: 'var(--primary)' }} fill="var(--primary)" />
        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.05em' }}>CRM MASTER</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} style={{ textDecoration: 'none' }}>
              <div className={`nav-item ${isActive ? 'active' : ''}`}>
                {item.icon}
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <div className="nav-item logout" style={{ cursor: 'pointer', color: 'var(--text-muted)' }}>
          <LogOut size={20} />
          <span>Sair da Conta</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
