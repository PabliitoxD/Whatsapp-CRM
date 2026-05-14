'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Smartphone, 
  CheckCircle, 
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
      <div className="page-header">
        <div>
          <h1>Configurações <span className="text-primary">Master</span></h1>
          <p className="text-muted text-lg font-medium mt-2">Gestão de conectividade e segurança da rede.</p>
        </div>
        <button className="btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={18} /> Nova Instância
        </button>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header-unified">
            <div className="card-title-group">
              <div className="card-icon-box"><Smartphone size={20} /></div>
              <h3>Aparelhos Conectados</h3>
            </div>
          </div>
          
          <div className="card-inner">
            {isAdding && (
              <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl mb-8 animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black uppercase text-primary">Identificação do Aparelho</span>
                  <button onClick={() => setIsAdding(false)} className="text-muted hover:text-white"><X size={18} /></button>
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Ex: Atendimento Comercial" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  <button className="btn-primary" style={{ padding: '0 1.5rem' }} onClick={handleAdd}><Plus size={24} /></button>
                </div>
              </div>
            )}

            {instances.length === 0 ? (
              <div className="empty-state py-20">
                <Smartphone size={40} className="empty-state-icon" />
                <p>Nenhuma instância cadastrada</p>
              </div>
            ) : (
              <div className="space-y-6">
                {instances.map((instance) => (
                  <div key={instance.id} className="p-6 bg-black/20 rounded-2xl border border-white/5">
                    <div className="flex justify-between items-center mb-8">
                      <div className="flex items-center gap-4">
                        <div className="card-icon-box"><Smartphone size={18} /></div>
                        <span className="font-bold text-lg">{instance.name}</span>
                      </div>
                      <button onClick={() => handleDelete(instance.id)} className="p-2 text-muted hover:text-error transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex flex-col items-center py-6">
                      {instance.status === 'connected' ? (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4 mx-auto border border-success/20">
                            <CheckCircle size={32} className="text-success" />
                          </div>
                          <p className="font-black text-success uppercase text-xs tracking-widest">Conectado com Sucesso</p>
                        </div>
                      ) : instance.qrCode ? (
                        <div className="text-center">
                          <div className="bg-white p-3 rounded-2xl inline-block mb-4">
                            <img src={instance.qrCode} alt="QR Code" className="w-40 h-40" />
                          </div>
                          <p className="text-xs text-muted font-bold uppercase tracking-widest">Escaneie com seu WhatsApp</p>
                        </div>
                      ) : (
                        <div className="text-center w-full">
                          {instance.status === 'connecting' ? (
                            <div className="flex flex-col items-center">
                              <Loader2 className="animate-spin text-primary mb-4" size={32} />
                              <p className="text-[10px] font-black text-muted uppercase tracking-widest">Gerando Token...</p>
                            </div>
                          ) : (
                            <button className="btn-primary w-full py-4" onClick={() => connectInstance(instance.id)}>
                              Gerar QR Code de Conexão
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="card-header-unified">
              <div className="card-title-group">
                <div className="card-icon-box"><Globe size={18} /></div>
                <h3>Integrações API</h3>
              </div>
            </div>
            <div className="card-inner">
              <p className="text-muted text-sm leading-relaxed mb-6">Sincronize seus disparos com CRM externos via Webhooks.</p>
              <button className="btn-primary w-full opacity-40 cursor-not-allowed" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
                Configurações Avançadas (Breve)
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header-unified">
              <div className="card-title-group">
                <div className="card-icon-box"><Lock size={18} /></div>
                <h3>Segurança 2FA</h3>
              </div>
            </div>
            <div className="card-inner">
              <p className="text-muted text-sm leading-relaxed mb-6">Ative a autenticação em duas etapas para proteger sua conta.</p>
              <button className="btn-primary w-full opacity-40 cursor-not-allowed" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
                Ativar Proteção (Breve)
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-header-unified">
              <div className="card-title-group">
                <div className="card-icon-box"><Server size={18} /></div>
                <h3>Status do Core</h3>
              </div>
            </div>
            <div className="card-inner">
              <div className="bg-black/60 p-5 rounded-xl font-mono text-[10px] text-success/70 leading-relaxed border border-white/5 h-32 overflow-y-auto">
                [LOG] WhatsApp Server v2.1.0 online<br/>
                [LOG] Aguardando novas conexões...<br/>
                [LOG] Banco de dados sincronizado.<br/>
                [LOG] Gateway de mensagens pronto.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
