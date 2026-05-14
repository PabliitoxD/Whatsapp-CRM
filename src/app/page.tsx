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

  const StatCard = ({ label, value, icon: Icon, colorClass = 'text-primary' }: any) => (
    <div className="card">
      <div className="card-inner">
        <p className="text-muted text-[10px] font-black uppercase mb-6 tracking-widest opacity-50">{label}</p>
        <div className="flex items-center justify-between">
          <span className="text-4xl font-black">{value}</span>
          <div className="card-icon-box">
            <Icon size={22} className={colorClass} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1>Dashboard <span className="text-primary">Master</span></h1>
          <p className="text-muted text-lg font-medium mt-2">Visão estratégica e analítica da sua operação.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Base Total" value={contacts.length} icon={Users} />
        <StatCard label="Entregues" value={totalSent} icon={Send} colorClass="text-success" />
        <StatCard label="Falhas" value={totalErrors} icon={AlertCircle} colorClass="text-error" />
        <StatCard label="Instâncias" value={instances.filter(i => i.status === 'connected').length} icon={Smartphone} />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header-unified">
            <div className="card-title-group">
              <div className="card-icon-box"><Smartphone size={20} /></div>
              <h3>Monitor de Aparelhos</h3>
            </div>
          </div>
          <div className="card-inner">
            {instances.length === 0 ? (
              <div className="empty-state">
                <Smartphone size={40} className="empty-state-icon" />
                <p>Sem instâncias configuradas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {instances.map((instance) => (
                  <div key={instance.id} className="flex items-center justify-between p-5 bg-black/20 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className={`w-2.5 h-2.5 rounded-full ${instance.status === 'connected' ? 'bg-success shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-error'}`} />
                      <span className="font-bold text-lg">{instance.name}</span>
                    </div>
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${instance.status === 'connected' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                      {instance.status === 'connected' ? 'Online' : 'Offline'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header-unified">
            <div className="card-title-group">
              <div className="card-icon-box"><BarChart3 size={20} /></div>
              <h3>Performance Recente</h3>
            </div>
          </div>
          <div className="card-inner">
            {campaigns.length === 0 ? (
              <div className="empty-state">
                <BarChart3 size={40} className="empty-state-icon" />
                <p>Nenhuma campanha registrada</p>
              </div>
            ) : (
              <div className="space-y-6">
                {campaigns.map((camp) => (
                  <div key={camp.id} className="p-6 bg-black/20 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-lg font-black">{camp.name}</span>
                      <span className="text-[10px] font-bold opacity-40 uppercase">{new Date(camp.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-[10px] text-muted uppercase font-black mb-1">Sucesso</p>
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
                    <div className="w-full bg-black/40 h-2 rounded-full mt-6 overflow-hidden border border-white/5">
                      <div 
                        className="bg-primary h-full transition-all duration-1000" 
                        style={{ width: `${Math.round(((camp.success + camp.error) / camp.total) * 100)}%` }} 
                      />
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

export default Dashboard;
