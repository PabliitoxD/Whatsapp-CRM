'use client';

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Users, 
  MessageSquare, 
  Clock,
  Play,
  Pause,
  AlertCircle,
  Terminal
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useContacts } from '../../lib/ContactContext';
import { io, Socket } from 'socket.io-client';

const Campaigns = () => {
  const { contacts } = useContacts();
  const [message, setMessage] = useState('');
  const [delay, setDelay] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ total: 0, success: 0, error: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('message-sent', (data) => {
      if (data.success) {
        setStats(prev => ({ ...prev, success: prev.success + 1 }));
        addLog(`✅ Sucesso para: ${data.to}`);
      } else {
        setStats(prev => ({ ...prev, error: prev.error + 1 }));
        addLog(`❌ Erro para ${data.to}: ${data.error}`);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const replaceTags = (text: string, contact: any) => {
    return text
      .replace(/{{nome}}/g, contact.name)
      .replace(/{{telefone}}/g, contact.phone);
  };

  const startCampaign = async () => {
    if (contacts.length === 0) {
      alert('Importe contatos primeiro!');
      return;
    }
    if (!message) {
      alert('Digite uma mensagem!');
      return;
    }
    if (!socket) {
      alert('Servidor WhatsApp não conectado!');
      return;
    }

    setIsRunning(true);
    setStats({ total: contacts.length, success: 0, error: 0 });
    setProgress(0);
    addLog('🚀 Iniciando campanha...');

    for (let i = 0; i < contacts.length; i++) {
      if (!isRunning && i > 0) break; // Allow stop (needs more logic for full pause)

      const contact = contacts[i];
      const personalizedMessage = replaceTags(message, contact);
      
      addLog(`⏳ Enviando para ${contact.name}...`);
      socket.emit('send-message', { to: contact.phone, message: personalizedMessage });

      setProgress(Math.round(((i + 1) / contacts.length) * 100));

      if (i < contacts.length - 1) {
        addLog(`💤 Aguardando ${delay}s...`);
        await new Promise(resolve => setTimeout(resolve, delay * 1000));
      }
    }

    setIsRunning(false);
    addLog('🏁 Campanha finalizada!');
  };

  return (
    <div className="campaigns-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Disparo em <span className="gradient-text">Massa</span></h1>
          <p>Configure e inicie suas campanhas de marketing pelo WhatsApp.</p>
        </div>
      </header>

      <div className="campaign-grid">
        <div className="campaign-form glass">
          <div className="form-section">
            <label><Users size={16} /> Público Alvo</label>
            <div className="stats-info">
              <strong>{contacts.length}</strong> contatos carregados
            </div>
          </div>

          <div className="form-section">
            <label><MessageSquare size={16} /> Mensagem da Campanha</label>
            <div className="message-input-wrapper">
              <textarea 
                placeholder="Olá {{nome}}, temos uma oferta especial para você..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="variables-hint">
                Tags disponíveis: <code>{'{{nome}}'}</code>, <code>{'{{telefone}}'}</code>
              </div>
            </div>
          </div>

          <div className="form-section">
            <label><Clock size={16} /> Intervalo entre envios (segundos)</label>
            <input 
              type="number" 
              value={delay} 
              onChange={(e) => setDelay(parseInt(e.target.value))}
              min="1"
            />
            <p className="hint">Mantenha entre 30-60s para maior segurança.</p>
          </div>

          <div className="form-actions">
            <button 
              className={`btn-primary gradient-bg full-width ${isRunning ? 'disabled' : ''}`}
              onClick={startCampaign}
              disabled={isRunning}
            >
              <Play size={18} />
              {isRunning ? 'Campanha em Execução...' : 'Iniciar Campanha'}
            </button>
          </div>
        </div>

        <div className="campaign-status">
          <div className="status-overview glass">
            <h3>Progresso da Campanha</h3>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-stats">
              <span>{progress}% Completo</span>
              <span>{stats.success + stats.error} / {contacts.length}</span>
            </div>
          </div>

          <div className="stats-mini-grid">
            <div className="stat-mini glass">
              <div className="stat-icon success"><Send size={16} /></div>
              <div className="stat-details">
                <span className="stat-label">Sucesso</span>
                <span className="stat-val">{stats.success}</span>
              </div>
            </div>
            <div className="stat-mini glass">
              <div className="stat-icon error"><AlertCircle size={16} /></div>
              <div className="stat-details">
                <span className="stat-label">Erros</span>
                <span className="stat-val">{stats.error}</span>
              </div>
            </div>
            <div className="stat-mini glass">
              <div className="stat-icon info"><Clock size={16} /></div>
              <div className="stat-details">
                <span className="stat-label">Restante</span>
                <span className="stat-val">{contacts.length - (stats.success + stats.error)}</span>
              </div>
            </div>
          </div>

          <div className="live-log glass">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={16} /> Log em Tempo Real
            </h3>
            <div className="log-container">
              {logs.length === 0 ? (
                <div className="log-placeholder">
                  Nenhuma atividade registrada.
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="log-entry">{log}</div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .campaigns-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .campaign-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .campaign-form {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-section {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .form-section label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.7);
        }

        select, input, textarea {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          padding: 0.75rem 1rem;
          color: white;
          font-size: 1rem;
          outline: none;
          transition: var(--transition);
        }

        select:focus, input:focus, textarea:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.05);
        }

        textarea {
          min-height: 150px;
          resize: vertical;
        }

        .variables-hint {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 0.5rem;
        }

        .variables-hint code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.1rem 0.3rem;
          border-radius: 4px;
          color: var(--accent);
        }

        .hint {
          font-size: 0.75rem;
          color: var(--warning);
          opacity: 0.8;
        }

        .full-width {
          width: 100%;
          justify-content: center;
        }

        .status-overview {
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .status-overview h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .progress-bar-container {
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-bar {
          height: 100%;
          background: var(--accent-gradient);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-stats {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .stats-mini-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .stat-mini {
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .stat-icon {
          color: var(--primary);
        }

        .stat-label {
          display: block;
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .stat-val {
          font-weight: 700;
          font-size: 1rem;
        }

        .live-log {
          padding: 1.5rem;
          flex: 1;
        }

        .live-log h3 {
          font-size: 1rem;
          margin-bottom: 1rem;
        }

        .log-container {
          height: 200px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
          padding: 1rem;
          font-family: monospace;
          font-size: 0.875rem;
          overflow-y: auto;
        }

        .log-placeholder {
          color: rgba(255, 255, 255, 0.2);
          text-align: center;
          margin-top: 4rem;
        }

        @media (max-width: 900px) {
          .campaign-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Campaigns;
