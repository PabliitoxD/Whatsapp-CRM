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
      <div className="sidebar-logo">
        <div className="relative">
          <Zap size={32} className="logo-icon text-primary" fill="var(--primary)" />
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
        </div>
        <span className="gradient-text">CRM Master</span>
      </div>

      <nav className="sidebar-nav flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <div className={`nav-item ${isActive ? 'active' : ''}`}>
                <div className={`nav-icon-wrapper ${isActive ? 'text-white' : 'text-white/40'}`}>
                  {item.icon}
                </div>
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer mt-auto pt-6 border-t border-white/5">
        <div className="nav-item logout group hover:bg-error/10 hover:border-error/20 transition-all">
          <LogOut size={20} className="text-white/40 group-hover:text-error transition-colors" />
          <span className="group-hover:text-error transition-colors">Sair da Conta</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
