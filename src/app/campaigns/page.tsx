'use client';

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Play, 
  BarChart2,
  Smartphone,
  MessageSquare,
  Activity,
  CheckCircle,
  AlertCircle,
  Clock
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
      <div className="page-header mb-12">
        <h1 className="text-4xl font-black mb-2">Gestão de <span style={{ color: 'var(--primary)' }}>Campanhas</span></h1>
        <p className="text-muted text-lg">Crie disparos em massa com variáveis dinâmicas e monitoramento real.</p>
      </div>

      <div className="grid-2">
        {/* Coluna Esquerda: Criar Campanha */}
        <div className="card">
          <div className="card-header border-b border-white/5 pb-6 mb-10">
            <h3 className="card-title flex items-center gap-3"><Play size={22} className="text-primary" /> Nova Campanha</h3>
          </div>
          
          <div className="space-y-6">
            <div>
              <label>Nome da Campanha</label>
              <input type="text" placeholder="Ex: Promoção VIP" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
            </div>

            <div>
              <label>Aparelho de Envio</label>
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
              <label>Modelo de Mensagem</label>
              <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
                <option value="">Selecione um modelo...</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Delay entre envios (Segundos)</label>
              <input type="number" value={delay} onChange={(e) => setDelay(parseInt(e.target.value))} />
            </div>

            <button className="btn-primary w-full py-5 mt-6 shadow-[0_15px_30px_rgba(139,92,246,0.3)]" onClick={startCampaign} disabled={isRunning}>
              <Send size={20} /> {isRunning ? 'Enviando Mensagens...' : 'Iniciar Campanha Agora'}
            </button>
          </div>

          {/* Mini Log */}
          {isRunning && (
            <div className="mt-12 animate-fade-in">
              <div className="flex justify-between text-[11px] font-black uppercase text-muted mb-3 tracking-widest">
                <span>Progresso Total</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-black h-3 rounded-full overflow-hidden border border-white/5">
                <div className="bg-primary h-full transition-all duration-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-6 p-5 bg-black/60 rounded-2xl border border-white/5 font-mono text-[11px] h-48 overflow-y-auto leading-relaxed">
                {logs.map((log, i) => <div key={i} className="mb-2 border-b border-white/[0.02] pb-1 last:border-0">{log}</div>)}
              </div>
            </div>
          )}
        </div>

        {/* Coluna Direita: Histórico e Detalhes */}
        <div className="card">
          <div className="card-header border-b border-white/5 pb-6 mb-10">
            <h3 className="card-title flex items-center gap-3"><BarChart2 size={22} className="text-primary" /> Relatórios Detalhados</h3>
          </div>

          <div className="space-y-8">
            {campaigns.length === 0 ? (
              <div className="text-center py-32 opacity-20">
                <Activity size={48} className="mx-auto mb-6" />
                <p className="font-bold uppercase tracking-widest text-sm">Aguardando dados</p>
              </div>
            ) : (
              campaigns.map((camp) => (
                <div key={camp.id} className="p-8 bg-black/40 rounded-3xl border border-white/10 hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-xl font-black tracking-tight">{camp.name}</span>
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${camp.status === 'Rodando' ? 'bg-primary/20 text-primary border border-primary/20 animate-pulse' : 'bg-success/10 text-success border border-success/20'}`}>
                      {camp.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-muted uppercase font-black tracking-widest mb-2">Sucesso</p>
                      <p className="text-2xl font-black text-success">{camp.success}</p>
                    </div>
                    <div className="text-center bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-muted uppercase font-black tracking-widest mb-2">Erros</p>
                      <p className="text-2xl font-black text-error">{camp.error}</p>
                    </div>
                    <div className="text-center bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-muted uppercase font-black tracking-widest mb-2">Abertura</p>
                      <p className="text-2xl font-black opacity-30">--</p>
                    </div>
                    <div className="text-center bg-white/[0.02] p-5 rounded-2xl border border-white/5">
                      <p className="text-[9px] text-muted uppercase font-black tracking-widest mb-2">Resposta</p>
                      <p className="text-2xl font-black opacity-30">--</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted mt-8 pt-6 border-t border-white/5 font-bold uppercase tracking-widest opacity-50">
                    <span className="flex items-center gap-2"><Smartphone size={12} /> Aparelho: {instances.find(i => i.id === camp.id)?.name || 'Desconhecido'}</span>
                    <span className="flex items-center gap-2"><CheckCircle size={12} /> {camp.total} Leads</span>
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
