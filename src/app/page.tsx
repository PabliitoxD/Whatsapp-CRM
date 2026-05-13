'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Send, 
  Zap,
  Smartphone,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';
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
      <div className="card-header mb-8">
        <h1 className="text-3xl font-extrabold">Dashboard <span style={{ color: 'var(--primary)' }}>Master</span></h1>
        <p className="text-muted">Acompanhamento geral e status de instâncias.</p>
      </div>

      {/* Relatório Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <div className="card">
          <p className="text-muted text-xs font-bold uppercase mb-1">Contatos na Base</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black">{contacts.length}</span>
            <Users size={20} className="text-primary" />
          </div>
        </div>
        <div className="card">
          <p className="text-muted text-xs font-bold uppercase mb-1">Envios com Sucesso</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-success">{totalSent}</span>
            <Send size={20} className="text-success" />
          </div>
        </div>
        <div className="card">
          <p className="text-muted text-xs font-bold uppercase mb-1">Erros de Disparo</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-error">{totalErrors}</span>
            <AlertCircle size={20} className="text-error" />
          </div>
        </div>
        <div className="card">
          <p className="text-muted text-xs font-bold uppercase mb-1">Instâncias Ativas</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black">{instances.filter(i => i.status === 'connected').length}</span>
            <Smartphone size={20} className="text-primary" />
          </div>
        </div>
      </div>

      <div className="grid-2">
        {/* Coluna 1: Aparelhos Conectados */}
        <div className="card">
          <div className="card-header border-b border-white/5 pb-4 mb-4" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h3 className="card-title flex items-center gap-2"><Smartphone size={18} /> Aparelhos Conectados</h3>
          </div>
          <div className="space-y-4">
            {instances.length === 0 ? (
              <p className="text-muted text-center py-8">Nenhuma instância cadastrada.</p>
            ) : (
              instances.map((instance) => (
                <div key={instance.id} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${instance.status === 'connected' ? 'bg-success' : 'bg-error'}`} />
                    <span className="font-semibold text-sm">{instance.name}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${instance.status === 'connected' ? 'bg-success/20 text-success' : 'bg-error/20 text-error'}`}>
                    {instance.status === 'connected' ? 'Online' : 'Offline'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna 2: Relatório de Campanhas */}
        <div className="card">
          <div className="card-header border-b border-white/5 pb-4 mb-4">
            <h3 className="card-title flex items-center gap-2"><BarChart3 size={18} /> Relatórios de Campanhas</h3>
          </div>
          <div className="space-y-4 overflow-y-auto" style={{ maxHeight: '500px' }}>
            {campaigns.length === 0 ? (
              <p className="text-muted text-center py-8">Nenhuma campanha realizada.</p>
            ) : (
              campaigns.map((camp) => (
                <div key={camp.id} className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold">{camp.name}</span>
                    <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-muted">{new Date(camp.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-[10px] text-muted uppercase font-bold">Sucesso</p>
                      <p className="text-lg font-black text-success">{camp.success}</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-[10px] text-muted uppercase font-bold">Erros</p>
                      <p className="text-lg font-black text-error">{camp.error}</p>
                    </div>
                    <div className="text-center border-l border-white/5">
                      <p className="text-[10px] text-muted uppercase font-bold">Total</p>
                      <p className="text-lg font-black">{camp.total}</p>
                    </div>
                  </div>
                  <div className="w-full bg-black h-1.5 rounded-full mt-4 overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all" 
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
