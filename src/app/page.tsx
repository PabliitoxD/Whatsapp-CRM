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
      <div className="page-header mb-12">
        <h1 className="text-4xl font-black mb-2">Dashboard <span style={{ color: 'var(--primary)' }}>Master</span></h1>
        <p className="text-muted text-lg">Acompanhamento estratégico e status operacional das suas instâncias.</p>
      </div>

      {/* Relatório Geral em Stats Grid */}
      <div className="stats-grid">
        <div className="card">
          <p className="text-muted text-[10px] font-extrabold uppercase mb-2 tracking-widest">Base Total</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black">{contacts.length}</span>
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Users size={20} /></div>
          </div>
        </div>
        <div className="card">
          <p className="text-muted text-[10px] font-extrabold uppercase mb-2 tracking-widest">Entregues</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-success">{totalSent}</span>
            <div className="p-2 bg-success/10 rounded-lg text-success"><Send size={20} /></div>
          </div>
        </div>
        <div className="card">
          <p className="text-muted text-[10px] font-extrabold uppercase mb-2 tracking-widest">Recusados</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-error">{totalErrors}</span>
            <div className="p-2 bg-error/10 rounded-lg text-error"><AlertCircle size={20} /></div>
          </div>
        </div>
        <div className="card">
          <p className="text-muted text-[10px] font-extrabold uppercase mb-2 tracking-widest">Conectados</p>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black">{instances.filter(i => i.status === 'connected').length}</span>
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><Smartphone size={20} /></div>
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Coluna 1: Aparelhos Conectados */}
        <div className="card">
          <div className="card-header border-b border-white/5 pb-6 mb-8">
            <h3 className="card-title flex items-center gap-3"><Smartphone size={22} className="text-primary" /> Aparelhos</h3>
          </div>
          <div className="space-y-4">
            {instances.length === 0 ? (
              <p className="text-muted text-center py-12 italic">Nenhuma instância cadastrada.</p>
            ) : (
              instances.map((instance) => (
                <div key={instance.id} className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${instance.status === 'connected' ? 'bg-success shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-error'}`} />
                    <span className="font-bold text-base">{instance.name}</span>
                  </div>
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${instance.status === 'connected' ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'}`}>
                    {instance.status === 'connected' ? 'Online' : 'Offline'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna 2: Relatório de Campanhas */}
        <div className="card">
          <div className="card-header border-b border-white/5 pb-6 mb-8">
            <h3 className="card-title flex items-center gap-3"><BarChart3 size={22} className="text-primary" /> Campanhas Recentes</h3>
          </div>
          <div className="space-y-6 overflow-y-auto pr-2" style={{ maxHeight: '600px' }}>
            {campaigns.length === 0 ? (
              <p className="text-muted text-center py-12 italic">Aguardando o primeiro disparo.</p>
            ) : (
              campaigns.map((camp) => (
                <div key={camp.id} className="p-6 bg-black/40 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-lg font-black tracking-tight">{camp.name}</span>
                    <span className="text-[10px] font-bold bg-white/5 px-3 py-1.5 rounded-lg text-muted uppercase tracking-widest">{new Date(camp.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-[10px] text-muted uppercase font-black tracking-widest mb-1">Sucesso</p>
                      <p className="text-2xl font-black text-success">{camp.success}</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-[10px] text-muted uppercase font-black tracking-widest mb-1">Erros</p>
                      <p className="text-2xl font-black text-error">{camp.error}</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-[10px] text-muted uppercase font-black tracking-widest mb-1">Total</p>
                      <p className="text-2xl font-black">{camp.total}</p>
                    </div>
                  </div>
                  <div className="w-full bg-black/60 h-2 rounded-full mt-6 overflow-hidden border border-white/5">
                    <div 
                      className="bg-primary h-full transition-all duration-1000 shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
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
