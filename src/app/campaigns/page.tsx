'use client';

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Play, 
  Clock,
  Terminal,
  Smartphone,
  MessageSquare,
  Type,
  CheckCircle,
  AlertCircle,
  BarChart2
} from 'lucide-react';
import { useContacts } from '../../lib/ContactContext';
import { io, Socket } from 'socket.io-client';

const Campaigns = () => {
  const { contacts, templates, instances, campaigns, customTags, addCampaign, updateCampaignStats } = useContacts();
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
      
      // Substituir todas as tags dinâmicas
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
      <div className="card-header mb-8">
        <h1 className="text-3xl font-extrabold">Gestão de <span style={{ color: 'var(--primary)' }}>Campanhas</span></h1>
        <p className="text-muted">Criação e acompanhamento detalhado.</p>
      </div>

      <div className="grid-2">
        {/* Coluna Esquerda: Criar Campanha */}
        <div className="card">
          <div className="card-header border-b border-white/5 pb-4 mb-4">
            <h3 className="card-title flex items-center gap-2"><Play size={18} /> Nova Campanha</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase text-muted mb-2 block">Nome da Campanha</label>
              <input type="text" placeholder="Ex: Promoção de Verão" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-muted mb-2 block">Aparelho de Envio</label>
              <select value={selectedInstanceId} onChange={(e) => setSelectedInstanceId(e.target.value)}>
                <option value="">Selecione um aparelho...</option>
                {instances.map(i => (
                  <option key={i.id} value={i.id} disabled={i.status !== 'connected'}>
                    {i.name} ({i.status === 'connected' ? 'Online' : 'Offline'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-muted mb-2 block">Modelo de Mensagem</label>
              <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
                <option value="">Selecione um modelo...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-muted mb-2 block">Delay entre envios (Seg)</label>
              <input type="number" value={delay} onChange={(e) => setDelay(parseInt(e.target.value))} />
            </div>

            <button className="btn-primary w-full py-4 mt-4" onClick={startCampaign} disabled={isRunning}>
              <Send size={18} /> {isRunning ? 'Enviando...' : 'Iniciar Disparos'}
            </button>
          </div>

          {/* Mini Log */}
          {isRunning && (
            <div className="mt-8">
              <div className="flex justify-between text-[10px] font-bold uppercase text-muted mb-2">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-black h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-4 p-3 bg-black/40 rounded border border-white/5 font-mono text-[10px] h-32 overflow-y-auto">
                {logs.map((log, i) => <div key={i} className="mb-1">{log}</div>)}
              </div>
            </div>
          )}
        </div>

        {/* Coluna Direita: Histórico e Detalhes */}
        <div className="card">
          <div className="card-header border-b border-white/5 pb-4 mb-4">
            <h3 className="card-title flex items-center gap-2"><BarChart2 size={18} /> Detalhes das Campanhas</h3>
          </div>

          <div className="space-y-6">
            {campaigns.length === 0 ? (
              <p className="text-muted text-center py-20">Nenhuma campanha registrada.</p>
            ) : (
              campaigns.map((camp) => (
                <div key={camp.id} className="p-5 bg-black/40 rounded-xl border border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">{camp.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${camp.status === 'Rodando' ? 'bg-primary/20 text-primary' : 'bg-success/20 text-success'}`}>
                      {camp.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                    <div className="text-center bg-white/5 p-3 rounded-lg">
                      <p className="text-[9px] text-muted uppercase font-bold">Enviados</p>
                      <p className="text-md font-bold text-success">{camp.success}</p>
                    </div>
                    <div className="text-center bg-white/5 p-3 rounded-lg">
                      <p className="text-[9px] text-muted uppercase font-bold">Recusados</p>
                      <p className="text-md font-bold text-error">{camp.error}</p>
                    </div>
                    <div className="text-center bg-white/5 p-3 rounded-lg">
                      <p className="text-[9px] text-muted uppercase font-bold">Abertura</p>
                      <p className="text-md font-bold">-- %</p>
                    </div>
                    <div className="text-center bg-white/5 p-3 rounded-lg">
                      <p className="text-[9px] text-muted uppercase font-bold">Resposta</p>
                      <p className="text-md font-bold">-- %</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted mt-4 pt-4 border-t border-white/5">
                    <span>Aparelho: <b className="text-white">{instances.find(i => i.id === camp.id)?.name || 'Padrão'}</b></span>
                    <span>Total de leads: <b className="text-white">{camp.total}</b></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Campaigns;
