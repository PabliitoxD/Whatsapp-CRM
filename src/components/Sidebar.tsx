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
    { name: 'Modelos', icon: <MessageSquare size={20} />, path: '/templates' },
    { name: 'Campanhas', icon: <Send size={20} />, path: '/campaigns' },
    { name: 'Configurações', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Zap size={32} className="logo-icon" fill="var(--primary)" />
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

      <div className="sidebar-footer" style={{ marginTop: 'auto', padding: '1rem' }}>
        <div className="nav-item logout" style={{ color: 'rgba(255,50,50,0.8)' }}>
          <LogOut size={20} />
          <span>Sair</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
