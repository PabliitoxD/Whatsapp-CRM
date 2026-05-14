'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    const newSocket = io({ 
      path: '/socket.io-custom',
      transports: ['polling', 'websocket'],
      secure: true
    });
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

      {/* Área Principal: Monitor de Aparelhos e Performance */}
      <div className="grid-2">
        {/* Bloco de Instâncias: Mostra o status de cada conexão WhatsApp */}
        <UICard title="Monitor de Aparelhos" icon={Smartphone}>
          {instances.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem 0' }}>
              <Smartphone size={48} className="empty-state-icon" />
              <p>Nenhuma instância configurada no sistema.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {instances.map((instance) => (
                <div key={instance.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Indicador visual de status (Luz de conexão) */}
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: instance.status === 'connected' ? 'var(--success)' : 'var(--error)', boxShadow: instance.status === 'connected' ? '0 0 15px rgba(16,185,129,0.5)' : 'none' }} />
                    <span style={{ fontWeight: 700, fontSize: '1.125rem', letterSpacing: '-0.02em' }}>{instance.name}</span>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 900, padding: '0.5rem 1rem', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.1em', backgroundColor: instance.status === 'connected' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: instance.status === 'connected' ? 'var(--success)' : 'var(--error)' }}>
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
            <div className="empty-state" style={{ padding: '3rem 0' }}>
              <BarChart3 size={48} className="empty-state-icon" />
              <p>Aguardando o início do primeiro disparo estratégico.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {campaigns.map((camp) => (
                <div key={camp.id} style={{ padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{camp.name}</span>
                    <span style={{ fontSize: '10px', fontWeight: 700, opacity: 0.3, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{new Date(camp.createdAt).toLocaleDateString()}</span>
                  </div>
                  {/* Barra de Progresso Visual */}
                  <div style={{ width: '100%', backgroundColor: 'rgba(0,0,0,0.4)', height: '10px', borderRadius: '999px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div 
                      style={{ backgroundColor: 'var(--primary)', height: '100%', transition: 'all 1s ease', width: `${Math.round(((camp.success + camp.error) / camp.total) * 100)}%`, boxShadow: '0 0 15px rgba(139,92,246,0.3)' }} 
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
