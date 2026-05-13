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
  Terminal,
  Type,
  Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useContacts } from '../../lib/ContactContext';
import { io, Socket } from 'socket.io-client';

const Campaigns = () => {
  const { contacts, templates, instances, addCampaign, updateCampaignStats } = useContacts();
  const [campaignName, setCampaignName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedInstanceId, setSelectedInstanceId] = useState('');
  const [delay, setDelay] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCampaignId, setCurrentCampaignId] = useState<string | null>(null);
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

  useEffect(() => {
    if (currentCampaignId) {
      updateCampaignStats(currentCampaignId, { 
        success: stats.success, 
        error: stats.error,
        status: isRunning ? 'Rodando' : 'Finalizada'
      });
    }
  }, [stats, isRunning, currentCampaignId]);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 50));
  };

  const replaceTags = (text: string, contact: any) => {
    return text
      .replace(/{{nome}}/g, contact.name)
      .replace(/{{telefone}}/g, contact.phone);
  };

  const startCampaign = async () => {
    if (!selectedInstanceId) {
      alert('Selecione um aparelho para o disparo!');
      return;
    }
    if (!campaignName) {
      alert('Digite o nome da campanha!');
      return;
    }
    if (!selectedTemplateId) {
      alert('Selecione um modelo de mensagem!');
      return;
    }
    if (contacts.length === 0) {
      alert('Importe contatos primeiro!');
      return;
    }
    if (!socket) {
      alert('Servidor WhatsApp não conectado!');
      return;
    }

    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return;

    const campId = addCampaign({
      name: campaignName,
      templateId: selectedTemplateId,
      total: contacts.length
    });
    setCurrentCampaignId(campId);

    setIsRunning(true);
    setStats({ total: contacts.length, success: 0, error: 0 });
    setProgress(0);
    addLog(`🚀 Iniciando campanha: ${campaignName}`);

    for (let i = 0; i < contacts.length; i++) {
      if (!isRunning && i > 0) break; 

      const contact = contacts[i];
      const personalizedMessage = replaceTags(template.content, contact);
      
      addLog(`⏳ Enviando para ${contact.name}...`);
      socket.emit('send-message', { 
        instanceId: selectedInstanceId,
        to: contact.phone, 
        message: personalizedMessage 
      });

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
            <label><Smartphone size={16} /> Selecionar Aparelho</label>
            <select value={selectedInstanceId} onChange={(e) => setSelectedInstanceId(e.target.value)}>
              <option value="">Escolha um aparelho...</option>
              {instances.map(i => (
                <option key={i.id} value={i.id} disabled={i.status !== 'connected'}>
                  {i.name} ({i.status === 'connected' ? 'Online' : 'Offline'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <label><Type size={16} /> Nome da Campanha</label>
            <input 
              type="text" 
              placeholder="Ex: Campanha de Lançamento" 
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>

          <div className="form-section">
            <label><Users size={16} /> Público Alvo</label>
            <div className="stats-info">
              <strong>{contacts.length}</strong> contatos carregados
            </div>
          </div>

          <div className="form-section">
            <label><MessageSquare size={16} /> Modelo de Mensagem</label>
            <select 
              value={selectedTemplateId} 
              onChange={(e) => setSelectedTemplateId(e.target.value)}
            >
              <option value="">Selecione um modelo...</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {selectedTemplateId && (
              <div className="template-preview-box">
                {templates.find(t => t.id === selectedTemplateId)?.content}
              </div>
            )}
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
    </div>
  );
};

export default Campaigns;
