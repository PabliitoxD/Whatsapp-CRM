'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Send, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Zap,
  Smartphone,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useContacts } from '../lib/ContactContext';
import { io, Socket } from 'socket.io-client';

const Dashboard = () => {
  const { contacts, campaigns, instances, updateInstance } = useContacts();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('instance-status', ({ id, status }) => {
      updateInstance(id, { status });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const stats = [
    { title: 'Total de Contatos', value: contacts.length, icon: <Users size={24} />, color: '#8b5cf6' },
    { title: 'Mensagens Enviadas', value: campaigns.reduce((acc, c) => acc + c.success, 0), icon: <Send size={24} />, color: '#10b981' },
    { title: 'Campanhas Realizadas', value: campaigns.length, icon: <Zap size={24} />, color: '#00f2fe' },
    { title: 'Aparelhos Ativos', value: instances.filter(i => i.status === 'connected').length, icon: <Smartphone size={24} />, color: '#f59e0b' },
  ];

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Resumo do <span className="gradient-text">CRM Master</span></h1>
          <p>Acompanhe suas métricas e status em tempo real.</p>
        </div>
      </header>

      <div className="stats-grid">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="stat-card glass"
          >
            <div className="stat-icon-wrapper" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.title}</span>
              <span className="stat-val">{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="whatsapp-status-card glass">
          <div className="card-header">
            <h3>Status das Instâncias</h3>
            <span className="text-xs text-muted">{instances.length} cadastradas</span>
          </div>

          <div className="instance-list p-4">
            {instances.length === 0 ? (
              <div className="empty-instances text-center py-8">
                <p className="text-sm text-muted">Vá em Configurações para adicionar seu primeiro WhatsApp.</p>
              </div>
            ) : (
              instances.map((instance) => (
                <div key={instance.id} className="instance-item flex items-center justify-between p-4 mb-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`status-dot ${instance.status}`}></div>
                    <div>
                      <p className="font-semibold text-sm">{instance.name}</p>
                      <p className="text-xs text-muted">ID: {instance.id}</p>
                    </div>
                  </div>
                  <span className={`status-badge ${instance.status}`}>
                    {instance.status === 'connected' ? 'Ativo' : instance.status === 'connecting' ? 'Pendente' : 'Off'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="recent-activity glass">
          <div className="card-header">
            <h3>Histórico de Campanhas</h3>
          </div>
          <div className="activity-list p-4">
            {campaigns.length === 0 ? (
              <div className="empty-activity text-center py-12">
                <p className="text-muted">Nenhuma campanha realizada ainda.</p>
              </div>
            ) : (
              campaigns.slice(0, 5).map((camp) => (
                <div key={camp.id} className="activity-item flex items-center justify-between p-4 mb-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="activity-icon text-primary"><Send size={16} /></div>
                    <div>
                      <p className="font-semibold text-sm">{camp.name}</p>
                      <div className="flex gap-3 text-xs text-muted mt-1">
                        <span>✅ {camp.success}</span>
                        <span>❌ {camp.error}</span>
                        <span>📅 {new Date(camp.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`status-badge ${camp.status.toLowerCase()}`}>{camp.status}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .status-dot.connected { background: var(--success); box-shadow: 0 0 10px var(--success); }
        .status-dot.connecting { background: var(--warning); }
        .status-dot.disconnected { background: var(--error); }
      `}</style>
    </div>
  );
};

export default Dashboard;
