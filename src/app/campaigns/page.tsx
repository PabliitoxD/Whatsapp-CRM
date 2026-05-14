'use client';

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Play, 
  BarChart2,
  Smartphone,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  History
} from 'lucide-react';
import { useContacts } from '../../lib/ContactContext';
import { io, Socket } from 'socket.io-client';

const Campaigns = () => {
  const { 
    contacts, 
    templates, 
    instances, 
    campaigns, 
    customTags, 
    addCampaign, 
    updateCampaignStats 
  } = useContacts();
  
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

  const startCampaign = async () => {
    if (!selectedInstanceId || !campaignName || !selectedTemplateId) {
      alert('Preencha todos os campos!');
      return;
    }
    if (contacts.length === 0) {
      alert('Importe contatos primeiro!');
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
      let msg = template.content;
      
      customTags.forEach(tag => {
        const regex = new RegExp(`{{${tag}}}`, 'g');
        const value = (contact as any)[tag] || ''; 
        msg = msg.replace(regex, value);
      });
      
      socket?.emit('send-message', { instanceId: selectedInstanceId, to: contact.phone, message: msg });
      setProgress(Math.round(((i + 1) / contacts.length) * 100));

      if (i < contacts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * 1000));
      }
    }
    setIsRunning(false);
    addLog('🏁 Campanha finalizada!');
  };

  return (
    <div className="campaigns-page">
      <div className="page-header">
        <div>
          <h1>Gestão de <span className="text-primary">Campanhas</span></h1>
          <p className="text-muted text-lg font-medium mt-2">Disparos estratégicos com monitoramento em tempo real.</p>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header-unified">
            <div className="card-title-group">
              <div className="card-icon-box"><Play size={20} /></div>
              <h3>Configurar Disparo</h3>
            </div>
          </div>
          <div className="card-inner">
            <div className="input-group">
              <label>Identificação</label>
              <input type="text" placeholder="Ex: Campanha de Black Friday" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
            </div>

            <div className="input-group">
              <label>Canal de Envio</label>
              <select value={selectedInstanceId} onChange={(e) => setSelectedInstanceId(e.target.value)}>
                <option value="">Selecione um aparelho...</option>
                {instances.map(i => (
                  <option key={i.id} value={i.id} disabled={i.status !== 'connected'}>
                    {i.name} ({i.status === 'connected' ? 'Online' : 'Offline'})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Estratégia (Modelo)</label>
              <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
                <option value="">Selecione um modelo...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Intervalo de Segurança (Segundos)</label>
              <input type="number" value={delay} onChange={(e) => setDelay(parseInt(e.target.value))} />
            </div>

            <button className="btn-primary w-full py-4 mt-4" onClick={startCampaign} disabled={isRunning}>
              <Send size={18} /> {isRunning ? 'Processando Envios...' : 'Lançar Campanha Agora'}
            </button>

            {isRunning && (
              <div className="mt-10 pt-8 border-t border-white/5 animate-fade-in">
                <div className="flex justify-between text-[10px] font-black uppercase text-muted mb-3 tracking-widest">
                  <span>Progresso da Operação</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-primary h-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="mt-6 p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-[10px] h-32 overflow-y-auto leading-relaxed text-muted">
                  {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header-unified">
            <div className="card-title-group">
              <div className="card-icon-box"><History size={20} /></div>
              <h3>Histórico de Performance</h3>
            </div>
          </div>
          <div className="card-inner">
            {campaigns.length === 0 ? (
              <div className="empty-state py-20">
                <BarChart2 size={40} className="empty-state-icon" />
                <p>Nenhuma campanha realizada</p>
              </div>
            ) : (
              <div className="space-y-6">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="p-6 bg-black/20 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-black">{camp.name}</span>
                      <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${camp.status === 'Rodando' ? 'bg-primary/20 text-primary animate-pulse' : 'bg-success/10 text-success'}`}>
                        {camp.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-[10px] text-muted uppercase font-black mb-1">Entregues</p>
                        <p className="text-2xl font-black text-success">{camp.success}</p>
                      </div>
                      <div className="text-center border-l border-white/5">
                        <p className="text-[10px] text-muted uppercase font-black mb-1">Falhas</p>
                        <p className="text-2xl font-black text-error">{camp.error}</p>
                      </div>
                      <div className="text-center border-l border-white/5">
                        <p className="text-[10px] text-muted uppercase font-black mb-1">Total</p>
                        <p className="text-2xl font-black">{camp.total}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
