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
      <div className="card-header mb-8">
        <h1 className="text-3xl font-extrabold">Configurações do <span style={{ color: 'var(--primary)' }}>Sistema</span></h1>
        <p className="text-muted">Gerencie instâncias e configurações de infraestrutura.</p>
      </div>

      <div className="grid-2">
        {/* Coluna Esquerda: Conectar Instância */}
        <div className="card">
          <div className="card-header border-b border-white/5 pb-4 mb-6">
            <h3 className="card-title flex items-center gap-2"><Smartphone size={18} /> Instâncias WhatsApp</h3>
            <button className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }} onClick={() => setIsAdding(true)}>
              <Plus size={14} /> Nova
            </button>
          </div>

          {isAdding && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase">Nome do Aparelho</span>
                <button onClick={() => setIsAdding(false)}><X size={16} /></button>
              </div>
              <input type="text" placeholder="Ex: Vendas 01" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <button className="btn-primary w-full" onClick={handleAdd}>Criar Instância</button>
            </div>
          )}

          <div className="space-y-4">
            {instances.length === 0 ? (
              <p className="text-muted text-center py-20">Nenhuma instância operando.</p>
            ) : (
              instances.map((instance) => (
                <div key={instance.id} className="p-5 bg-black/40 rounded-xl border border-white/5">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <Smartphone size={20} className="text-primary" />
                      <div>
                        <p className="font-bold text-sm">{instance.name}</p>
                        <p className="text-[10px] text-muted">ID: {instance.id}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(instance.id)} className="text-muted hover:text-error">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex flex-col items-center py-4">
                    {instance.status === 'connected' ? (
                      <div className="text-center text-success">
                        <CheckCircle size={48} className="mx-auto mb-2" />
                        <p className="font-bold text-sm">Conectado</p>
                      </div>
                    ) : instance.qrCode ? (
                      <div className="text-center">
                        <div className="bg-white p-2 rounded-xl inline-block mb-4">
                          <img src={instance.qrCode} alt="QR Code" className="w-40 h-40" />
                        </div>
                        <p className="text-xs font-bold">Escaneie para Conectar</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        {instance.status === 'connecting' ? (
                          <Loader2 className="animate-spin text-primary mx-auto mb-2" size={32} />
                        ) : (
                          <button className="btn-primary" onClick={() => connectInstance(instance.id)}>Gerar QR Code</button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Coluna Direita: Outras Possibilidades */}
        <div className="space-y-6">
          <div className="card">
            <div className="card-header border-b border-white/5 pb-4 mb-4">
              <h3 className="card-title flex items-center gap-2"><Globe size={18} /> API & Webhooks</h3>
            </div>
            <p className="text-sm text-muted mb-4">Integre seu CRM com outras plataformas via Webhooks.</p>
            <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', width: '100%' }}>
              Configurar Webhooks (Em breve)
            </button>
          </div>

          <div className="card">
            <div className="card-header border-b border-white/5 pb-4 mb-4">
              <h3 className="card-title flex items-center gap-2"><Lock size={18} /> Segurança</h3>
            </div>
            <p className="text-sm text-muted mb-4">Proteja seu painel com autenticação em dois fatores.</p>
            <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', width: '100%' }}>
              Ativar 2FA (Em breve)
            </button>
          </div>

          <div className="card">
            <div className="card-header border-b border-white/5 pb-4 mb-4">
              <h3 className="card-title flex items-center gap-2"><Server size={18} /> Logs do Sistema</h3>
            </div>
            <div className="bg-black p-3 rounded font-mono text-[10px] text-success h-32 overflow-y-auto">
              [SYSTEM] Servidor Node.js rodando na porta 3001<br/>
              [SYSTEM] Monitor de instâncias ativo<br/>
              [SYSTEM] Aguardando conexões...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
