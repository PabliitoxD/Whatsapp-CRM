'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Play, BarChart2, Smartphone, History, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useContacts } from '../../lib/ContactContext';
import { io, Socket } from 'socket.io-client';
import { PageHeader, UICard, UIButton } from '../../components/UIComponents';

/**
 * PÁGINA: CAMPANHAS (EXECUÇÃO E MONITORAMENTO)
 * 
 * Responsável por configurar os disparos e monitorar o progresso em tempo real.
 * Utiliza Sockets para receber feedback instantâneo de cada mensagem enviada.
 */

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
  
  // Estados locais para configuração do envio
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
  const router = useRouter();

  // Conexão com o servidor de sockets para status em tempo real
  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Quando uma mensagem é disparada com sucesso ou falha
    newSocket.on('message-sent', (data) => {
      if (data.success) {
        setStats(prev => ({ ...prev, success: prev.success + 1 }));
        addLog(`✅ Sucesso: ${data.to}`);
      } else {
        setStats(prev => ({ ...prev, error: prev.error + 1 }));
        addLog(`❌ Falha (${data.to}): ${data.error}`);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Sincroniza as estatísticas locais com o contexto global para persistência
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

  // Motor principal de disparos (Loop com delay configurável)
  const startCampaign = async () => {
    if (!selectedInstanceId || !campaignName || !selectedTemplateId) {
      alert('Selecione todos os campos obrigatórios!');
      return;
    }
    if (contacts.length === 0) {
      alert('Importe leads no menu Audiência antes de começar!');
      return;
    }

    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return;

    // Registra a campanha no sistema
    const campId = addCampaign({
      name: campaignName,
      templateId: selectedTemplateId,
      total: contacts.length
    });
    
    setCurrentCampaignId(campId);
    setIsRunning(true);
    setStats({ total: contacts.length, success: 0, error: 0 });
    setProgress(0);
    addLog(`🚀 Iniciando Lançamento: ${campaignName}`);

    // Loop de envio sequencial
    for (let i = 0; i < contacts.length; i++) {
      if (!isRunning && i > 0) break; 
      
      const contact = contacts[i];
      let msg = template.content;
      
      // Substituição dinâmica das tags {{nome}}, {{empresa}}, etc.
      customTags.forEach(tag => {
        const regex = new RegExp(`{{${tag}}}`, 'g');
        const value = (contact as any)[tag] || ''; 
        msg = msg.replace(regex, value);
      });
      
      // Envia evento via socket para o backend disparar no WhatsApp
      socket?.emit('send-message', { instanceId: selectedInstanceId, to: contact.phone, message: msg });
      
      // Atualiza progresso visual
      setProgress(Math.round(((i + 1) / contacts.length) * 100));

      // Delay de segurança entre cada mensagem (Evita bloqueios)
      if (i < contacts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * 1000));
      }
    }
    
    setIsRunning(false);
    addLog('🏁 Operação Finalizada!');
  };

  return (
    <div className="campaigns-page">
      <PageHeader 
        title="Gestão de Campanhas" 
        subtitle="Configure disparos estratégicos e monitore a performance em tempo real."
      />

      <div className="grid-2">
        {/* CONFIGURAÇÃO DO DISPARO */}
        <UICard title="Configurar Disparo" icon={Play}>
          <div className="space-y-6">
            <div className="input-group">
              <label>Identificação da Campanha</label>
              <input type="text" placeholder="Ex: Black Friday - VIPs" value={campaignName} onChange={(e) => setCampaignName(e.target.value)} />
            </div>

            <div className="input-group">
              <label>Caminho de Saída (Aparelho)</label>
              {instances.length === 0 ? (
                <UIButton onClick={() => router.push('/settings')} style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  Nenhum aparelho cadastrado. Adicionar?
                </UIButton>
              ) : (
                <select value={selectedInstanceId} onChange={(e) => setSelectedInstanceId(e.target.value)}>
                  <option value="">Selecione um aparelho conectado...</option>
                  {instances.map(i => (
                    <option key={i.id} value={i.id} disabled={i.status !== 'connected'}>
                      {i.name} ({i.status === 'connected' ? 'ONLINE' : 'OFFLINE'})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="input-group">
              <label>Engenharia de Mensagem (Modelo)</label>
              {templates.length === 0 ? (
                <UIButton onClick={() => router.push('/templates')} style={{ width: '100%', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                  Nenhum modelo cadastrado. Criar agora?
                </UIButton>
              ) : (
                <select value={selectedTemplateId} onChange={(e) => setSelectedTemplateId(e.target.value)}>
                  <option value="">Selecione um modelo estratégico...</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="input-group">
              <label>Intervalo de Segurança (Segundos)</label>
              <input type="number" value={delay} onChange={(e) => setDelay(parseInt(e.target.value))} />
            </div>

            <UIButton onClick={startCampaign} style={{ width: '100%', height: '70px', fontSize: '1.1rem' }} disabled={isRunning}>
              <Send size={22} /> {isRunning ? 'PROCESSO EM ANDAMENTO...' : 'LANÇAR CAMPANHA AGORA'}
            </UIButton>

            {/* MONITOR DE PROGRESSO ATIVO */}
            {isRunning && (
              <div className="mt-12 pt-10 border-t border-white/5">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-black text-muted uppercase tracking-widest">Progresso Real</span>
                  <span className="text-primary font-black">{progress}%</span>
                </div>
                <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden border border-white/5">
                  <div className="bg-primary h-full transition-all duration-500 shadow-[0_0_20px_rgba(139,92,246,0.4)]" style={{ width: `${progress}%` }} />
                </div>
                
                {/* LOG DE OPERAÇÕES */}
                <div className="mt-8 p-6 bg-black/60 rounded-2xl border border-white/5 font-mono text-xs h-48 overflow-y-auto leading-loose text-muted">
                  {logs.map((log, i) => <div key={i} className={log.includes('✅') ? 'text-success/80' : log.includes('❌') ? 'text-error/80' : ''}>{log}</div>)}
                </div>
              </div>
            )}
          </div>
        </UICard>

        {/* HISTÓRICO DE PERFORMANCE */}
        <UICard title="Histórico de Performance" icon={History}>
          {campaigns.length === 0 ? (
            <div className="empty-state py-20">
              <BarChart2 size={56} className="empty-state-icon" />
              <p className="font-black opacity-30">Nenhuma campanha realizada ainda.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {campaigns.map((camp) => (
                <div key={camp.id} className="p-8 bg-black/20 rounded-[28px] border border-white/5">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-xl font-black">{camp.name}</span>
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${camp.status === 'Rodando' ? 'bg-primary/20 text-primary animate-pulse' : 'bg-success/10 text-success'}`}>
                      {camp.status}
                    </span>
                  </div>
                  {/* Grid de métricas da campanha */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-[10px] text-muted uppercase font-black mb-3">Entregues</p>
                      <p className="text-3xl font-black text-success">{camp.success}</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-[10px] text-muted uppercase font-black mb-3">Falhas</p>
                      <p className="text-3xl font-black text-error">{camp.error}</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-[10px] text-muted uppercase font-black mb-3">Leads</p>
                      <p className="text-3xl font-black">{camp.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </UICard>
      </div>
    </div>
  );
};

export default Campaigns;
