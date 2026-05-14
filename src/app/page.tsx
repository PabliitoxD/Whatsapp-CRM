'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Send, 
  Smartphone,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { useContacts } from '../lib/ContactContext';
import { io, Socket } from 'socket.io-client';

const Dashboard = () => {
  const { contacts, campaigns, instances, updateInstance } = useContacts();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('instance-status', ({ id, status }) => {
      updateInstance(id, { status });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const totalSent = campaigns.reduce((acc, c) => acc + c.success, 0);
  const totalErrors = campaigns.reduce((acc, c) => acc + c.error, 0);

  return (
    <div className="dashboard-page">
      <div className="page-header mb-12" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '2.5rem' }}>
        <h1 className="text-5xl font-black mb-3 tracking-tighter">Dashboard <span style={{ color: 'var(--primary)' }}>Master</span></h1>
        <p className="text-muted text-xl font-medium">Visão analítica em tempo real da sua operação de mensagens.</p>
      </div>

      {/* Relatório Geral em Stats Grid */}
      <div className="stats-grid">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <p className="text-muted text-[11px] font-black uppercase mb-6 tracking-[0.2em] opacity-60">Base de Leads</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-4xl font-black">{contacts.length}</span>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} />
            </div>
          </div>
        </div>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <p className="text-muted text-[11px] font-black uppercase mb-6 tracking-[0.2em] opacity-60">Mensagens Entregues</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-4xl font-black text-success">{totalSent}</span>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={24} />
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <p className="text-muted text-[11px] font-black uppercase mb-6 tracking-[0.2em] opacity-60">Falhas de Envio</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-4xl font-black text-error">{totalErrors}</span>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={24} />
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <p className="text-muted text-[11px] font-black uppercase mb-6 tracking-[0.2em] opacity-60">Instâncias Online</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="text-4xl font-black">{instances.filter(i => i.status === 'connected').length}</span>
            <div style={{ width: '50px', height: '50px', borderRadius: '14px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Coluna 1: Aparelhos Conectados */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '3rem', borderBottom: '1px solid var(--border)', background: 'white/[0.01]' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Smartphone size={28} className="text-primary" /> 
              <span>Monitor de Aparelhos</span>
            </h3>
          </div>
          <div style={{ padding: '3rem' }} className="space-y-6">
            {instances.length === 0 ? (
              <p className="text-muted text-center py-12 italic text-lg opacity-30">Nenhuma instância configurada.</p>
            ) : (
              instances.map((instance) => (
                <div key={instance.id} className="flex items-center justify-between p-6 bg-black/40 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-5">
                    <div className={`w-3 h-3 rounded-full ${instance.status === 'connected' ? 'bg-success shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-error'}`} />
                    <span className="font-bold text-lg">{instance.name}</span>
                  </div>
                  <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-[0.15em] ${instance.status === 'connected' ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'}`}>
                    {instance.status === 'connected' ? 'Online' : 'Offline'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna 2: Relatório de Campanhas */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '3rem', borderBottom: '1px solid var(--border)', background: 'white/[0.01]' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <BarChart3 size={28} className="text-primary" /> 
              <span>Fluxo de Campanhas</span>
            </h3>
          </div>
          <div className="space-y-8 overflow-y-auto pr-4" style={{ maxHeight: '700px', padding: '3rem' }}>
            {campaigns.length === 0 ? (
              <p className="text-muted text-center py-20 italic text-lg opacity-30">Aguardando início do primeiro disparo estratégico.</p>
            ) : (
              campaigns.map((camp) => (
                <div key={camp.id} className="p-8 bg-black/40 rounded-[32px] border border-white/5 group hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-xl font-black tracking-tight">{camp.name}</span>
                    <span className="text-[10px] font-bold bg-white/5 px-4 py-2 rounded-xl text-muted uppercase tracking-widest border border-white/10">{new Date(camp.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-8">
                    <div className="text-center">
                      <p className="text-[10px] text-muted uppercase font-black tracking-[0.15em] mb-2 opacity-50">Sucesso</p>
                      <p className="text-3xl font-black text-success">{camp.success}</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-[10px] text-muted uppercase font-black tracking-[0.15em] mb-2 opacity-50">Erros</p>
                      <p className="text-3xl font-black text-error">{camp.error}</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-[10px] text-muted uppercase font-black tracking-[0.15em] mb-2 opacity-50">Total</p>
                      <p className="text-3xl font-black">{camp.total}</p>
                    </div>
                  </div>
                  <div className="w-full bg-black/60 h-3 rounded-full mt-8 overflow-hidden border border-white/5">
                    <div 
                      className="bg-primary h-full transition-all duration-1000 shadow-[0_0_20px_rgba(139,92,246,0.4)]" 
                      style={{ width: `${Math.round(((camp.success + camp.error) / camp.total) * 100)}%` }} 
                    />
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

export default Dashboard;
