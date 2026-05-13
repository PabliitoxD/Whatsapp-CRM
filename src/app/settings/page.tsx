'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Smartphone, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  QrCode,
  RefreshCw
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
      updateInstance(id, { status, qrCode: status === 'connected' ? undefined : undefined });
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
      <header className="page-header">
        <div>
          <h1>Configurações de <span className="gradient-text">Conexão</span></h1>
          <p>Gerencie seus dispositivos e instâncias do WhatsApp.</p>
        </div>
        <button className="btn-primary gradient-bg" onClick={() => setIsAdding(true)}>
          <Plus size={18} />
          Nova Instância
        </button>
      </header>

      {isAdding && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 mb-8">
          <h3>Adicionar Novo Aparelho</h3>
          <div className="flex gap-4 mt-4">
            <input 
              type="text" 
              placeholder="Ex: Comercial 01" 
              value={newName} 
              className="flex-1"
              onChange={(e) => setNewName(e.target.value)} 
            />
            <button className="btn-primary gradient-bg" onClick={handleAdd}>Salvar</button>
            <button className="btn-secondary" onClick={() => setIsAdding(false)}>Cancelar</button>
          </div>
        </motion.div>
      )}

      <div className="instances-grid">
        {instances.length === 0 ? (
          <div className="empty-state glass p-12 text-center w-full">
            <Smartphone size={48} opacity={0.2} className="mx-auto mb-4" />
            <p>Nenhuma instância configurada.</p>
          </div>
        ) : (
          instances.map((instance) => (
            <motion.div key={instance.id} layout className="instance-card glass">
              <div className="card-header">
                <div className="flex items-center gap-3">
                  <Smartphone size={20} className="text-primary" />
                  <h4>{instance.name}</h4>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`status-badge ${instance.status}`}>
                    {instance.status === 'connected' ? 'Ativo' : instance.status === 'connecting' ? 'Conectando' : 'Inativo'}
                  </span>
                  <button className="text-muted hover:text-error" onClick={() => handleDelete(instance.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="instance-body p-6 flex flex-col items-center">
                {instance.status === 'connected' ? (
                  <div className="text-center">
                    <CheckCircle size={64} className="text-success mx-auto mb-4" />
                    <p className="font-bold">WhatsApp Conectado</p>
                    <p className="text-sm text-muted">Aparelho pronto para uso.</p>
                  </div>
                ) : instance.qrCode ? (
                  <div className="qr-box text-center">
                    <img src={instance.qrCode} alt="QR Code" className="w-48 h-48 bg-white p-2 rounded-lg mx-auto mb-4" />
                    <p className="text-sm font-semibold">Escaneie para conectar</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    {instance.status === 'connecting' ? (
                      <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
                    ) : (
                      <AlertCircle className="text-muted mx-auto mb-4" size={48} />
                    )}
                    <button className="btn-primary gradient-bg" onClick={() => connectInstance(instance.id)}>
                      {instance.status === 'connecting' ? 'Gerando QR...' : 'Gerar QR Code'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <style jsx>{`
        .instances-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }
        .instance-card {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
};

export default Settings;
