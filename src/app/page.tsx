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
  Loader2,
  Activity,
  ShieldCheck
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
    { title: 'Base de Contatos', value: contacts.length, icon: <Users size={24} />, color: '#8b5cf6', trend: '+12% este mês' },
    { title: 'Mensagens Enviadas', value: campaigns.reduce((acc, c) => acc + c.success, 0), icon: <Send size={24} />, color: '#10b981', trend: 'Taxa de 98% entrega' },
    { title: 'Campanhas Ativas', value: campaigns.length, icon: <Zap size={24} />, color: '#00f2fe', trend: 'Performance estável' },
    { title: 'Aparelhos Conectados', value: instances.filter(i => i.status === 'connected').length, icon: <Smartphone size={24} />, color: '#f59e0b', trend: `${instances.length} cadastrados` },
  ];

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="page-header">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1>Dashboard <span className="gradient-text">Geral</span></h1>
          <p>Visão estratégica das suas operações de WhatsApp.</p>
        </motion.div>
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
              <span className="text-[10px] opacity-40 font-semibold uppercase tracking-wider">{stat.trend}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-content mt-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="whatsapp-status-card glass"
        >
          <div className="card-header">
            <div className="flex items-center gap-3">
              <Activity size={20} className="text-primary" />
              <h3>Status de Conexão</h3>
            </div>
            <ShieldCheck size={20} className="text-success opacity-50" />
          </div>

          <div className="instance-list p-6">
            {instances.length === 0 ? (
              <div className="empty-instances text-center py-12">
                <Smartphone size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-sm text-muted">Nenhum aparelho configurado.</p>
                <button className="btn-secondary mt-4 text-xs">Configurar Agora</button>
              </div>
            ) : (
              instances.map((instance) => (
                <div key={instance.id} className="instance-item flex items-center justify-between p-4 mb-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`status-dot ${instance.status}`}></div>
                    <div>
                      <p className="font-bold text-sm">{instance.name}</p>
                      <p className="text-[10px] text-muted font-mono uppercase">ID: {instance.id}</p>
                    </div>
                  </div>
                  <span className={`status-badge ${instance.status}`}>
                    {instance.status === 'connected' ? 'Online' : 'Offline'}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="recent-activity glass"
        >
          <div className="card-header">
            <div className="flex items-center gap-3">
              <Clock size={20} className="text-primary" />
              <h3>Últimas Campanhas</h3>
            </div>
          </div>
          <div className="activity-list p-6">
            {campaigns.length === 0 ? (
              <div className="empty-activity text-center py-12">
                <Send size={48} className="mx-auto mb-4 opacity-10" />
                <p className="text-muted text-sm">Aguardando seu primeiro disparo.</p>
              </div>
            ) : (
              campaigns.slice(0, 5).map((camp) => (
                <div key={camp.id} className="activity-item flex items-center justify-between p-4 mb-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-4">
                    <div className="activity-icon text-primary bg-primary/10 p-2 rounded-lg"><Send size={16} /></div>
                    <div>
                      <p className="font-bold text-sm">{camp.name}</p>
                      <div className="flex gap-4 text-[11px] text-muted mt-1 font-medium">
                        <span className="flex items-center gap-1"><CheckCircle size={10} className="text-success" /> {camp.success}</span>
                        <span className="flex items-center gap-1"><AlertCircle size={10} className="text-error" /> {camp.error}</span>
                        <span>{new Date(camp.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-white/20" />
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          position: relative;
        }
        .status-dot.connected { 
          background: var(--success); 
          box-shadow: 0 0 15px var(--success);
        }
        .status-dot.connected::after {
          content: "";
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          border: 2px solid var(--success);
          animation: pulse 2s infinite;
        }
        .status-dot.connecting { background: var(--warning); }
        .status-dot.disconnected { background: var(--error); opacity: 0.5; }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
