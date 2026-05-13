'use client';

import React, { useState } from 'react';
import { 
  Send, 
  Users, 
  MessageSquare, 
  Clock,
  Play,
  Pause,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const Campaigns = () => {
  const [message, setMessage] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [delay, setDelay] = useState(30);

  const stats = [
    { label: 'Total de Envios', value: '0', icon: <Send size={16} /> },
    { label: 'Sucesso', value: '0', icon: <Clock size={16} /> },
    { label: 'Erros', value: '0', icon: <AlertCircle size={16} /> },
  ];

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
            <label><Users size={16} /> Selecionar Público</label>
            <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
              <option value="">Selecione um grupo ou lista...</option>
              <option value="all">Todos os Contatos (1,284)</option>
              <option value="leads">Novos Leads (150)</option>
              <option value="vip">Clientes VIP (45)</option>
            </select>
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
                Variáveis: <code>{'{{nome}}'}</code>, <code>{'{{telefone}}'}</code>
              </div>
            </div>
          </div>

          <div className="form-section">
            <label><Clock size={16} /> Intervalo entre envios (segundos)</label>
            <input 
              type="number" 
              value={delay} 
              onChange={(e) => setDelay(parseInt(e.target.value))}
              min="5"
            />
            <p className="hint">Recomendamos pelo menos 20-30 segundos para evitar bloqueios.</p>
          </div>

          <div className="form-actions">
            <button className="btn-primary gradient-bg full-width">
              <Play size={18} />
              Iniciar Campanha
            </button>
          </div>
        </div>

        <div className="campaign-status">
          <div className="status-overview glass">
            <h3>Progresso da Campanha</h3>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: '0%' }}></div>
            </div>
            <div className="progress-stats">
              <span>0% Completo</span>
              <span>0 / 0</span>
            </div>
          </div>

          <div className="stats-mini-grid">
            {stats.map((stat, i) => (
              <div key={i} className="stat-mini glass">
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-details">
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-val">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="live-log glass">
            <h3>Log de Envio em Tempo Real</h3>
            <div className="log-container">
              <div className="log-placeholder">
                Nenhuma campanha ativa no momento.
              </div>
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
