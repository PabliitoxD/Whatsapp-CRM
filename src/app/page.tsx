'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Send, 
  CheckCircle, 
  Clock, 
  Smartphone,
  QrCode,
  ShieldCheck,
  RefreshCw,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { useContacts } from '../lib/ContactContext';

const Dashboard = () => {
  const { contacts } = useContacts();
  const [wsStatus, setWsStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const socketRef = useRef<any>(null);
  
  useEffect(() => {
    socketRef.current = io('http://localhost:3001');

    socketRef.current.on('status', (status: any) => {
      setWsStatus(status);
      if (status === 'connected') setQrCode(null);
    });

    socketRef.current.on('qr', (url: string) => {
      setQrCode(url);
      setWsStatus('disconnected');
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const handleConnect = () => {
    setWsStatus('connecting');
    socketRef.current.emit('init');
  };

  const stats = [
    { title: 'Total Contatos', value: contacts.length.toLocaleString(), icon: <Users />, color: '#8b5cf6' },
    { title: 'Conexão', value: wsStatus === 'connected' ? 'Ativa' : 'Inativa', icon: <Zap />, color: wsStatus === 'connected' ? '#10b981' : '#ef4444' },
    { title: 'Listas', value: contacts.length > 0 ? '1' : '0', icon: <CheckCircle />, color: '#00f2fe' },
    { title: 'Aguardando', value: '0', icon: <Clock />, color: '#f59e0b' },
  ];

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Painel de <span className="gradient-text">Controle</span></h1>
          <p>Gerencie sua conexão e acompanhe o crescimento da sua base.</p>
        </div>
      </header>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="stat-card glass"
          >
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <span className="stat-title">{stat.title}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="dashboard-content">
        <div className="whatsapp-status-card glass">
          <div className="card-header">
            <div className="header-title">
              <Smartphone size={20} />
              <h3>Conexão WhatsApp</h3>
            </div>
            <div className={`status-badge ${wsStatus}`}>
              {wsStatus === 'connected' ? 'Conectado' : wsStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
            </div>
          </div>
          
          <div className="qr-container">
            {wsStatus === 'disconnected' && !qrCode ? (
              <div className="qr-placeholder">
                <QrCode size={64} opacity={0.2} />
                <p>Clique em "Conectar" para gerar o QR Code</p>
                <button className="btn-secondary" onClick={handleConnect}>
                  Conectar Agora
                </button>
              </div>
            ) : wsStatus === 'disconnected' && qrCode ? (
              <div className="qr-display">
                <img src={qrCode} alt="WhatsApp QR Code" />
                <button className="btn-secondary refresh" onClick={handleConnect}>
                  <RefreshCw size={14} /> Atualizar
                </button>
              </div>
            ) : wsStatus === 'connecting' ? (
              <div className="qr-loading">
                <div className="spinner"></div>
                <p>Iniciando WhatsApp...</p>
              </div>
            ) : (
              <div className="qr-success">
                <ShieldCheck size={48} color="#10b981" />
                <p>Dispositivo pronto para uso!</p>
              </div>
            )}
          </div>
          
          <div className="card-footer">
            <p>Escaneie o código com o seu WhatsApp para iniciar os envios.</p>
          </div>
        </div>

        <div className="recent-activity glass">
          <div className="card-header">
            <h3>Histórico de Campanhas</h3>
          </div>
          <div className="activity-list">
            {campaigns.length === 0 ? (
              <div className="empty-activity">
                <p>Nenhuma campanha realizada ainda.</p>
              </div>
            ) : (
              campaigns.slice(0, 5).map((camp) => (
                <div key={camp.id} className="activity-item">
                  <div className="activity-icon">
                    <Send size={16} />
                  </div>
                  <div className="activity-details">
                    <p><strong>{camp.name}</strong> - {camp.status}</p>
                    <div className="camp-mini-stats">
                      <span>✅ {camp.success}</span>
                      <span>❌ {camp.error}</span>
                      <span>📅 {new Date(camp.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .camp-mini-stats {
          display: flex;
          gap: 0.75rem;
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }
        .empty-activity {
          padding: 2rem;
          text-align: center;
          color: rgba(255, 255, 255, 0.2);
          font-size: 0.875rem;
        }
      `}</style>

      <style jsx>{`
        .dashboard-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        .page-header h1 {
          font-size: 2.25rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .page-header p {
          color: rgba(255, 255, 255, 0.5);
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .stat-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-title {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 0.25rem;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 1.5rem;
        }

        .whatsapp-status-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge.disconnected { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
        .status-badge.connecting { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .status-badge.connected { background: rgba(16, 185, 129, 0.1); color: #10b981; }

        .qr-container {
          flex: 1;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 12px;
          border: 2px dashed var(--glass-border);
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 250px;
          margin-bottom: 1rem;
        }

        .qr-placeholder {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .qr-placeholder p {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .qr-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .qr-display img {
          width: 200px;
          height: 200px;
          border-radius: 8px;
          background: white;
          padding: 10px;
        }

        .btn-secondary {
          background: var(--glass-border);
          color: white;
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--glass-border);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .recent-activity {
          padding: 1.5rem;
        }

        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.02);
          transition: var(--transition);
        }

        .activity-item:hover {
          background: rgba(255, 255, 255, 0.04);
        }

        .activity-icon {
          width: 32px;
          height: 32px;
          background: var(--glass-border);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }

        .activity-details p {
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .activity-details span {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
        }

        @media (max-width: 768px) {
          .dashboard-content {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
