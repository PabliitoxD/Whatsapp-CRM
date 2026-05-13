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
  ChevronRight,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useContacts } from '../lib/ContactContext';
import { io, Socket } from 'socket.io-client';

const Dashboard = () => {
  const { contacts, campaigns } = useContacts();
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('status', (data) => {
      setStatus(data.status);
      if (data.status === 'connected') setQrCode(null);
    });

    newSocket.on('qr', (data) => {
      setQrCode(data.qr);
      setStatus('connecting');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const connectWhatsApp = () => {
    if (socket) {
      socket.emit('start-session');
      setStatus('connecting');
    }
  };

  const stats = [
    { title: 'Total de Contatos', value: contacts.length, icon: <Users size={24} />, color: '#8b5cf6' },
    { title: 'Mensagens Enviadas', value: campaigns.reduce((acc, c) => acc + c.success, 0), icon: <Send size={24} />, color: '#10b981' },
    { title: 'Campanhas Realizadas', value: campaigns.length, icon: <Zap size={24} />, color: '#00f2fe' },
    { title: 'Modelos de Texto', value: 0, icon: <MessageSquare size={24} />, color: '#f59e0b' },
  ];

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Bem-vindo ao <span className="gradient-text">CRM Master</span></h1>
          <p>Seu painel centralizado para marketing no WhatsApp.</p>
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
            <h3>Conexão WhatsApp</h3>
            <span className={`status-badge ${status}`}>
              {status === 'connected' ? 'Conectado' : status === 'connecting' ? 'Conectando...' : 'Desconectado'}
            </span>
          </div>

          <div className="qr-container">
            {status === 'connected' ? (
              <div className="connected-state">
                <CheckCircle size={64} color="var(--success)" />
                <p>Pronto para disparos!</p>
              </div>
            ) : qrCode ? (
              <div className="qr-display">
                <img src={qrCode} alt="WhatsApp QR Code" />
                <p>Escaneie para conectar</p>
              </div>
            ) : (
              <div className="disconnected-state">
                {status === 'connecting' ? (
                  <Loader2 className="animate-spin" size={48} />
                ) : (
                  <AlertCircle size={48} opacity={0.2} />
                )}
                <button className="btn-primary mt-4 gradient-bg" onClick={connectWhatsApp}>
                  Conectar Agora
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="recent-activity glass">
          <div className="card-header">
            <h3>Histórico de Campanhas</h3>
          </div>
          <div className="activity-list">
            {campaigns.length === 0 ? (
              <div className="empty-activity text-center py-12">
                <p className="text-muted">Nenhuma campanha realizada ainda.</p>
              </div>
            ) : (
              campaigns.slice(0, 5).map((camp) => (
                <div key={camp.id} className="activity-item flex items-center justify-between p-4 mb-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="activity-icon text-primary"><Send size={16} /></div>
                    <div>
                      <p className="font-semibold">{camp.name}</p>
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
    </div>
  );
};

export default Dashboard;
