'use client';

import React, { useState, useEffect } from 'react';
import { Users, Send, Smartphone, AlertCircle, BarChart3 } from 'lucide-react';
import { useContacts } from '../lib/ContactContext';
import { io, Socket } from 'socket.io-client';
import { PageHeader, StatCard, UICard } from '../components/UIComponents';

/**
 * PÁGINA: DASHBOARD (VISÃO GERAL)
 * 
 * Esta página consolida as métricas principais do sistema.
 * Utiliza o sistema de UI padronizado para garantir alinhamento milimétrico.
 */

const Dashboard = () => {
  // Dados globais do contexto (Contatos, Campanhas, Instâncias)
  const { contacts, campaigns, instances, updateInstance } = useContacts();
  const [socket, setSocket] = useState<Socket | null>(null);

  // Inicialização do Socket para monitoramento em tempo real das instâncias
  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Escuta atualizações de status vindas do backend
    newSocket.on('instance-status', ({ id, status }) => {
      updateInstance(id, { status });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Cálculos de métricas agregadas das campanhas
  const totalSent = campaigns.reduce((acc, c) => acc + c.success, 0);
  const totalErrors = campaigns.reduce((acc, c) => acc + c.error, 0);

  return (
    <div className="dashboard-page">
      {/* Cabeçalho Padronizado: Título e Subtítulo alinhados pela base */}
      <PageHeader 
        title="Dashboard Master" 
        subtitle="Visão estratégica e analítica da sua operação em tempo real."
      />

      {/* Grid de Estatísticas: 4 colunas com cards de métricas rápidas */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', marginBottom: '2.5rem' }}>
        <StatCard label="Base Total" value={contacts.length} icon={Users} />
        <StatCard label="Entregues" value={totalSent} icon={Send} color="var(--success)" />
        <StatCard label="Falhas" value={totalErrors} icon={AlertCircle} color="var(--error)" />
        <StatCard label="Instâncias" value={instances.filter(i => i.status === 'connected').length} icon={Smartphone} />
      </div>

      {/* Ações Rápidas: Acesso imediato às funções principais solicitadas */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '4rem' }}>
        <UIButton onClick={() => window.location.href = '/templates'} style={{ flex: 1, height: '80px', fontSize: '1rem' }}>
          <Plus size={20} /> Criar Novo Template
        </UIButton>
        <UIButton onClick={() => window.location.href = '/settings'} style={{ flex: 1, height: '80px', fontSize: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white' }}>
          <Plus size={20} /> Adicionar Nova Instância
        </UIButton>
      </div>

      {/* Área Principal: Monitor de Aparelhos e Performance */}
      <div className="grid-2">
        {/* Bloco de Instâncias: Mostra o status de cada conexão WhatsApp */}
        <UICard title="Monitor de Aparelhos" icon={Smartphone}>
          {instances.length === 0 ? (
            <div className="empty-state">
              <Smartphone size={48} className="empty-state-icon" />
              <p>Nenhuma instância configurada no sistema.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {instances.map((instance) => (
                <div key={instance.id} className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    {/* Indicador visual de status (Luz de conexão) */}
                    <div className={`w-3 h-3 rounded-full ${instance.status === 'connected' ? 'bg-success shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-error'}`} />
                    <span className="font-bold text-lg tracking-tight">{instance.name}</span>
                  </div>
                  <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest ${instance.status === 'connected' ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'}`}>
                    {instance.status === 'connected' ? 'Online' : 'Offline'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </UICard>

        {/* Bloco de Campanhas: Histórico visual das últimas operações */}
        <UICard title="Performance Recente" icon={BarChart3}>
          {campaigns.length === 0 ? (
            <div className="empty-state">
              <BarChart3 size={48} className="empty-state-icon" />
              <p>Aguardando o início do primeiro disparo estratégico.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {campaigns.map((camp) => (
                <div key={camp.id} className="p-6 bg-black/20 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-xl font-black tracking-tight">{camp.name}</span>
                    <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">{new Date(camp.createdAt).toLocaleDateString()}</span>
                  </div>
                  {/* Barra de Progresso Visual */}
                  <div className="w-full bg-black/40 h-2.5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="bg-primary h-full transition-all duration-1000 shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                      style={{ width: `${Math.round(((camp.success + camp.error) / camp.total) * 100)}%` }} 
                    />
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

export default Dashboard;
