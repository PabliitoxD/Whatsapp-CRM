'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Smartphone, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Settings as SettingsIcon,
  Globe,
  Lock,
  Server
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    if (socket) {
      socket.emit('init-instance', id);
      updateInstance(id, { status: 'connecting' });
    }
  };

  const handleDelete = (id: string) => {
    if (socket) socket.emit('delete-instance', id);
    deleteInstance(id);
  };

  return (
    <div className="settings-page animate-fade-in">
      <header className="page-header flex justify-between items-end">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            Infraestrutura de <span className="gradient-text">WhatsApp</span>
          </motion.h1>
          <p>Gerencie suas instâncias e conexões de rede.</p>
        </div>
        <button className="btn-primary gradient-bg" onClick={() => setIsAdding(true)}>
          <Plus size={18} />
          <span>Nova Instância</span>
        </button>
      </header>

      <div className="settings-grid grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass p-4">
            <h4 className="text-[10px] font-bold uppercase tracking-widest opacity-30 mb-4 px-2">Configurações</h4>
            <div className="flex flex-col gap-1">
              <div className="nav-item active text-xs py-3 px-4 rounded-xl"><Smartphone size={16} /> Instâncias</div>
              <div className="nav-item text-xs py-3 px-4 rounded-xl opacity-20 cursor-not-allowed"><Globe size={16} /> API Webhooks</div>
              <div className="nav-item text-xs py-3 px-4 rounded-xl opacity-20 cursor-not-allowed"><Lock size={16} /> Segurança</div>
              <div className="nav-item text-xs py-3 px-4 rounded-xl opacity-20 cursor-not-allowed"><Server size={16} /> Logs de Servidor</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence>
            {isAdding && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="glass p-8 mb-8 border-primary/20"
              >
                <h3 className="text-xl font-extrabold mb-2 tracking-tight">Novo Aparelho</h3>
                <p className="text-sm text-muted mb-6">Dê um nome amigável para identificar sua conexão.</p>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    placeholder="Ex: WhatsApp Vendas Principal" 
                    value={newName} 
                    className="flex-1 bg-black/40"
                    onChange={(e) => setNewName(e.target.value)} 
                  />
                  <button className="btn-primary gradient-bg" onClick={handleAdd}>Confirmar</button>
                  <button className="btn-secondary" onClick={() => setIsAdding(false)}>Cancelar</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="instances-grid grid grid-cols-1 md:grid-cols-2 gap-6">
            {instances.length === 0 ? (
              <div className="empty-state glass p-20 text-center col-span-full">
                <Smartphone size={64} className="mx-auto mb-6 opacity-5" />
                <p className="text-lg font-bold opacity-20">Nenhuma instância operando.</p>
              </div>
            ) : (
              instances.map((instance) => (
                <motion.div key={instance.id} layout className="instance-card glass flex flex-col group">
                  <div className="card-header p-6 flex justify-between items-center bg-white/[0.01]">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Smartphone size={18} className="text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{instance.name}</h4>
                        <p className="text-[10px] opacity-30 font-mono">HASH_{instance.id}</p>
                      </div>
                    </div>
                    <button className="p-2 text-white/10 hover:text-error hover:bg-error/10 rounded-lg transition-all" onClick={() => handleDelete(instance.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="instance-body p-8 flex flex-col items-center justify-center flex-1">
                    {instance.status === 'connected' ? (
                      <div className="text-center animate-fade-in">
                        <div className="relative mb-6">
                          <CheckCircle size={80} className="text-success mx-auto" />
                          <div className="absolute inset-0 bg-success/20 blur-3xl rounded-full"></div>
                        </div>
                        <p className="text-lg font-black tracking-tight mb-1">Conexão Ativa</p>
                        <p className="text-xs text-muted font-medium">Sincronizado com sucesso</p>
                      </div>
                    ) : instance.qrCode ? (
                      <div className="qr-box text-center animate-scale-in">
                        <div className="relative p-4 bg-white rounded-3xl mb-6 inline-block shadow-2xl shadow-white/5">
                          <img src={instance.qrCode} alt="QR Code" className="w-48 h-48" />
                          <div className="absolute inset-0 border-4 border-primary/20 rounded-3xl"></div>
                        </div>
                        <p className="text-sm font-extrabold tracking-tight mb-1">Aguardando Leitura</p>
                        <p className="text-[10px] text-muted uppercase tracking-widest font-bold">Use o WhatsApp no seu celular</p>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        {instance.status === 'connecting' ? (
                          <div className="flex flex-col items-center">
                            <Loader2 className="animate-spin text-primary mb-6" size={56} />
                            <p className="text-sm font-bold opacity-40">Gerando instância segura...</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <AlertCircle className="text-white/5 mb-8" size={64} />
                            <button className="btn-primary gradient-bg px-10 py-4" onClick={() => connectInstance(instance.id)}>
                              Iniciar Conexão
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="card-footer p-4 bg-black/20 flex justify-between items-center px-6">
                    <span className={`status-badge ${instance.status}`}>
                      {instance.status}
                    </span>
                    <div className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                      <div className="w-1.5 h-1.5 rounded-full bg-white/10"></div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
