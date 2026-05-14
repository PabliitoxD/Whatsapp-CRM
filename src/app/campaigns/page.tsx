'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Play, BarChart2, Smartphone, History, CheckCircle, AlertCircle, Clock, X } from 'lucide-react';
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
    updateCampaignStats,
    deleteCustomTag
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
    const newSocket = io({ path: '/socket.io-custom' });
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
                <UIButton onClick={() => router.push('/settings?new=true')} style={{ width: '100%', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
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
                <UIButton onClick={() => router.push('/templates?new=true')} style={{ width: '100%', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
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
              <div style={{ marginTop: '3rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Progresso Real</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 900 }}>{progress}%</span>
                </div>
                <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', height: '12px', borderRadius: '999px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div style={{ backgroundColor: 'var(--primary)', height: '100%', transition: 'all 0.5s ease', width: `${progress}%`, boxShadow: '0 0 20px rgba(139,92,246,0.4)' }} />
                </div>
                
                {/* LOG DE OPERAÇÕES */}
                <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: '16px', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '0.75rem', height: '192px', overflowY: 'auto', lineHeight: '1.8', color: 'var(--text-muted)' }}>
                  {logs.map((log, i) => <div key={i} style={{ color: log.includes('✅') ? 'rgba(16, 185, 129, 0.8)' : log.includes('❌') ? 'rgba(239, 68, 68, 0.8)' : '' }}>{log}</div>)}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {campaigns.map((camp) => (
                <div key={camp.id} style={{ padding: '2rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{camp.name}</span>
                    <span style={{ fontSize: '0.625rem', fontWeight: 900, padding: '0.5rem 1rem', borderRadius: '99px', textTransform: 'uppercase', letterSpacing: '0.1em', background: camp.status === 'Rodando' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.1)', color: camp.status === 'Rodando' ? 'var(--primary)' : 'var(--success)' }}>
                      {camp.status}
                    </span>
                  </div>
                  {/* Grid de métricas da campanha */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.75rem' }}>Entregues</p>
                      <p style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--success)' }}>{camp.success}</p>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.75rem' }}>Falhas</p>
                      <p style={{ fontSize: '1.875rem', fontWeight: 900, color: 'var(--error)' }}>{camp.error}</p>
                    </div>
                    <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 900, marginBottom: '0.75rem' }}>Leads</p>
                      <p style={{ fontSize: '1.875rem', fontWeight: 900 }}>{camp.total}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ marginTop: '3rem' }}>
            <p style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: '1.5rem', opacity: 0.5 }}>Variáveis Ativas no Sistema</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {customTags.map((tag) => (
                /* TAG ITEM: Forçado em linha horizontal única */
                <div key={tag} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>
                      {'{'}{'{'}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap' }}>{tag}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {tag !== 'nome' && tag !== 'telefone' ? (
                      <button onClick={() => deleteCustomTag(tag)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
                        <X size={16} />
                      </button>
                    ) : (
                      <CheckCircle size={18} style={{ color: 'var(--success)', opacity: 0.6 }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </UICard>
      </div>
    </div>
  );
};

export default Campaigns;
