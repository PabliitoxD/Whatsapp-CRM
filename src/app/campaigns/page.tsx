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
  Smartphone,
  BarChart3,
  Rocket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1>Disparo em <span className="gradient-text">Massa</span></h1>
          <p>Potencialize seu alcance com automação inteligente.</p>
        </motion.div>
      </header>

      <div className="campaign-grid grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="campaign-form glass p-8">
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-3">
              <Rocket size={20} className="text-primary" /> Configuração
            </h3>

            <div className="form-section mb-6">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2 block">Aparelho de Envio</label>
              <select className="w-full" value={selectedInstanceId} onChange={(e) => setSelectedInstanceId(e.target.value)}>
                <option value="">Escolha uma conexão...</option>
                {instances.map(i => (
                  <option key={i.id} value={i.id} disabled={i.status !== 'connected'}>
                    {i.name} {i.status === 'connected' ? '🟢' : '🔴'}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-section mb-6">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2 block">Identificação</label>
              <input 
                type="text" 
                placeholder="Nome da Campanha" 
                className="w-full"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>

            <div className="form-section mb-6">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2 block">Modelo de Conteúdo</label>
              <select 
                className="w-full"
                value={selectedTemplateId} 
                onChange={(e) => setSelectedTemplateId(e.target.value)}
              >
                <option value="">Selecione o texto...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="form-section mb-8">
              <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 mb-2 block">Delay de Segurança (Seg)</label>
              <input 
                type="number" 
                className="w-full"
                value={delay} 
                onChange={(e) => setDelay(parseInt(e.target.value))}
                min="1"
              />
            </div>

            <button 
              className={`btn-primary gradient-bg w-full justify-center py-4 ${isRunning ? 'opacity-50 pointer-events-none' : ''}`}
              onClick={startCampaign}
              disabled={isRunning}
            >
              <Play size={18} />
              <span className="font-bold uppercase tracking-widest text-xs">
                {isRunning ? 'Executando...' : 'Lançar Campanha'}
              </span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="status-overview glass p-8">
            <h3 className="text-xl font-extrabold mb-6 flex items-center gap-3">
              <BarChart3 size={20} className="text-primary" /> Performance em Tempo Real
            </h3>
            
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Sucesso</p>
                <p className="text-3xl font-black text-success">{stats.success}</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Erros</p>
                <p className="text-3xl font-black text-error">{stats.error}</p>
              </div>
              <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Pendente</p>
                <p className="text-3xl font-black opacity-60">{contacts.length - (stats.success + stats.error)}</p>
              </div>
            </div>

            <div className="progress-container mb-2">
              <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest opacity-40 mb-3">
                <span>Progresso Geral</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  className="h-full bg-accent-gradient"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <div className="live-log glass p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-extrabold flex items-center gap-3">
                <Terminal size={20} className="text-primary" /> Log de Transmissão
              </h3>
              <span className="animate-pulse flex items-center gap-2 text-[10px] font-bold text-success uppercase tracking-widest">
                <span className="w-2 h-2 bg-success rounded-full"></span> Live
              </span>
            </div>
            <div className="log-container h-[250px] overflow-y-auto font-mono text-xs space-y-2 p-4 bg-black/40 rounded-2xl border border-white/5">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center opacity-10">
                  <p>Aguardando início do processo...</p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} key={i} className="log-entry py-1 border-b border-white/[0.02] last:border-0">
                    <span className="text-primary mr-2 opacity-50">[{new Date().toLocaleTimeString()}]</span>
                    <span className="text-white/80">{log}</span>
                  </motion.div>
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
