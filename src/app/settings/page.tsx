'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Smartphone, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Globe,
  Lock,
  Server,
  X
} from 'lucide-react';
import { useContacts } from '../../lib/ContactContext';
import { io, Socket } from 'socket.io-client';

const Settings = () => {
  const { instances, addInstance, deleteInstance, updateInstance } = useContacts();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('instance-qr', ({ id, qr }) => {
      updateInstance(id, { qrCode: qr, status: 'connecting' });
    });

    newSocket.on('instance-status', ({ id, status }) => {
      updateInstance(id, { status, qrCode: undefined });
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleAdd = () => {
    if (!newName) return;
    addInstance(newName);
    setNewName('');
    setIsAdding(false);
  };

  const connectInstance = (id: string) => {
    socket?.emit('init-instance', id);
    updateInstance(id, { status: 'connecting' });
  };

  const handleDelete = (id: string) => {
    socket?.emit('delete-instance', id);
    deleteInstance(id);
  };

  return (
    <div className="settings-page">
      <div className="page-header mb-12">
        <h1 className="text-4xl font-black mb-2">Configurações de <span style={{ color: 'var(--primary)' }}>Rede</span></h1>
        <p className="text-muted text-lg">Gerencie instâncias de WhatsApp e conectividade global.</p>
      </div>

      <div className="grid-2">
        {/* Coluna Esquerda: Conectar Instância */}
        <div className="card">
          <div className="card-header border-b border-white/5 pb-6 mb-10">
            <h3 className="card-title flex items-center gap-3"><Smartphone size={22} className="text-primary" /> Instâncias</h3>
            <button className="btn-primary" style={{ padding: '0.6rem 1rem', fontSize: '0.8rem' }} onClick={() => setIsAdding(true)}>
              <Plus size={16} /> Adicionar
            </button>
          </div>

          {isAdding && (
            <div className="p-8 bg-primary/5 border border-primary/20 rounded-2xl mb-10 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Identificação</span>
                <button onClick={() => setIsAdding(false)} className="text-muted hover:text-white"><X size={20} /></button>
              </div>
              <input type="text" placeholder="Ex: Vendas São Paulo" className="mb-4" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <button className="btn-primary w-full py-4" onClick={handleAdd}>Confirmar Criação</button>
            </div>
          )}

          <div className="space-y-8">
            {instances.length === 0 ? (
              <div className="text-center py-32 opacity-10">
                <Smartphone size={64} className="mx-auto mb-6" />
                <p className="font-bold uppercase tracking-widest text-xs">Sem instâncias</p>
              </div>
            ) : (
              instances.map((instance) => (
                <div key={instance.id} className="p-8 bg-black/40 rounded-3xl border border-white/10 hover:border-primary/20 transition-all">
                  <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <Smartphone size={24} />
                      </div>
                      <div>
                        <p className="font-black text-lg tracking-tight">{instance.name}</p>
                        <p className="text-[10px] text-muted font-bold tracking-widest uppercase">ID: {instance.id}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(instance.id)} className="p-3 bg-white/5 hover:bg-error/10 hover:text-error rounded-xl transition-all">
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="flex flex-col items-center py-10">
                    {instance.status === 'connected' ? (
                      <div className="text-center animate-fade-in">
                        <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mb-4 mx-auto border border-success/20">
                          <CheckCircle size={48} className="text-success" />
                        </div>
                        <p className="font-black text-xl text-success tracking-tight">Ativo & Conectado</p>
                        <p className="text-xs text-muted mt-1 uppercase font-bold tracking-widest">Tudo funcionando corretamente</p>
                      </div>
                    ) : instance.qrCode ? (
                      <div className="text-center animate-scale-in">
                        <div className="bg-white p-4 rounded-3xl inline-block mb-6 shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
                          <img src={instance.qrCode} alt="QR Code" className="w-48 h-48" />
                        </div>
                        <p className="text-base font-black tracking-tight mb-1">Aguardando Escaneamento</p>
                        <p className="text-[10px] text-muted uppercase font-black tracking-widest">Abra o WhatsApp e aponte a câmera</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        {instance.status === 'connecting' ? (
                          <div className="flex flex-col items-center py-8">
                            <Loader2 className="animate-spin text-primary mb-6" size={48} />
                            <p className="text-sm font-black opacity-30 uppercase tracking-widest">Iniciando Servidor...</p>
                          </div>
                        ) : (
                          <button className="btn-primary px-12 py-5 shadow-[0_15px_30px_rgba(139,92,246,0.3)]" onClick={() => connectInstance(instance.id)}>
                            Solicitar Token QR
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna Direita: Outras Opções */}
        <div className="space-y-8">
          <div className="card">
            <div className="card-header border-b border-white/5 pb-6 mb-8">
              <h3 className="card-title flex items-center gap-3"><Globe size={22} className="text-primary" /> API & Webhooks</h3>
            </div>
            <p className="text-muted text-base leading-relaxed mb-8">Sincronize seus disparos com RD Station, HubSpot ou ActiveCampaign em tempo real.</p>
            <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', width: '100%', paddingTop: '1.25rem', paddingBottom: '1.25rem' }}>
              <span className="opacity-40 font-black uppercase tracking-widest text-xs">Configurações Avançadas (Em breve)</span>
            </button>
          </div>

          <div className="card">
            <div className="card-header border-b border-white/5 pb-6 mb-8">
              <h3 className="card-title flex items-center gap-3"><Lock size={22} className="text-primary" /> Segurança</h3>
            </div>
            <p className="text-muted text-base leading-relaxed mb-8">Gerencie permissões de usuários e ative a autenticação de dois fatores (2FA).</p>
            <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', width: '100%', paddingTop: '1.25rem', paddingBottom: '1.25rem' }}>
              <span className="opacity-40 font-black uppercase tracking-widest text-xs">Módulos de Acesso (Em breve)</span>
            </button>
          </div>

          <div className="card">
            <div className="card-header border-b border-white/5 pb-6 mb-8">
              <h3 className="card-title flex items-center gap-3"><Server size={22} className="text-primary" /> Console do Servidor</h3>
            </div>
            <div className="bg-black/80 p-6 rounded-2xl font-mono text-[11px] text-success/80 h-48 overflow-y-auto leading-loose border border-white/5">
              <span className="opacity-40">[05:12:01]</span> WhatsApp Server Core v2.1.0<br/>
              <span className="opacity-40">[05:12:02]</span> Conectado ao Gateway Principal<br/>
              <span className="opacity-40">[05:12:02]</span> Pool de conexões otimizado<br/>
              <span className="opacity-40">[05:12:05]</span> Monitorando instâncias ativas...<br/>
              <span className="opacity-40">[05:12:10]</span> Sistema pronto para disparos.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
