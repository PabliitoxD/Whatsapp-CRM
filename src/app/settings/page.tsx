'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Smartphone, CheckCircle, Loader2, Globe, Lock, Server, X } from 'lucide-react';
import { useContacts } from '../../lib/ContactContext';
import { io, Socket } from 'socket.io-client';
import { PageHeader, UICard, UIButton } from '../../components/UIComponents';

/**
 * PÁGINA: CONFIGURAÇÕES DE REDE (INSTÂNCIAS E CONECTIVIDADE)
 * 
 * Gerencia as conexões do WhatsApp e outras configurações globais.
 * Permite a adição de novas instâncias e a visualização do QR Code de conexão.
 */

const Settings = () => {
  const { instances, addInstance, deleteInstance, updateInstance } = useContacts();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);

  // Monitoramento de Sockets para QR Code e Status de Conexão
  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    // Recebe o QR Code gerado pelo backend
    newSocket.on('instance-qr', ({ id, qr }) => {
      updateInstance(id, { qrCode: qr, status: 'connecting' });
    });

    // Recebe confirmação de sucesso na conexão
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
      <PageHeader 
        title="Configurações Master" 
        subtitle="Gerencie instâncias de WhatsApp e conectividade global do sistema."
      >
        <UIButton onClick={() => setIsAdding(true)}>
          <Plus size={18} /> Adicionar Nova Instância
        </UIButton>
      </PageHeader>

      <div className="grid-2">
        {/* COLUNA ESQUERDA: GESTÃO DE INSTÂNCIAS (APARELHOS) */}
        <UICard title="Aparelhos Conectados" icon={Smartphone}>
          <div className="space-y-8">
      {/* MODAL DE ADIÇÃO DE INSTÂNCIA */}
      {isAdding && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', boxShadow: '0 50px 100px rgba(0,0,0,0.8)' }}>
            <div className="card-header-unified" style={{ padding: '2.5rem 3.5rem' }}>
              <div className="card-title-group">
                <div className="card-icon-box"><Smartphone size={22} /></div>
                <h3>Novo Aparelho Estratégico</h3>
              </div>
              <button onClick={() => setIsAdding(false)} className="text-muted hover:text-white transition-all">
                <X size={28} />
              </button>
            </div>

            <div className="card-inner" style={{ padding: '3.5rem' }}>
              <div className="space-y-8">
                <div className="input-group">
                  <label>Identificação do Aparelho</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Suporte Comercial 01" 
                    value={newName} 
                    onChange={(e) => setNewName(e.target.value)} 
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
                  <UIButton variant="danger" onClick={() => setIsAdding(false)} style={{ background: 'transparent' }}>Cancelar</UIButton>
                  <UIButton onClick={handleAdd} style={{ padding: '1.25rem 3rem' }}>Criar Instância</UIButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

            {instances.length === 0 ? (
              <div className="empty-state py-20">
                <Smartphone size={56} className="empty-state-icon" />
                <p className="font-black opacity-30">Sem instâncias cadastradas.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {instances.map((instance) => (
                  <div key={instance.id} className="p-8 bg-black/20 rounded-[32px] border border-white/5 group">
                    <div className="flex justify-between items-center mb-10">
                      <div className="flex items-center gap-5">
                        <div className="card-icon-box"><Smartphone size={20} /></div>
                        <div>
                          <span className="font-black text-xl tracking-tight block">{instance.name}</span>
                          <span className="text-[9px] font-black uppercase text-muted tracking-widest mt-1">UUID: {instance.id.slice(0,8)}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(instance.id)} className="p-3 text-muted hover:text-error transition-all opacity-0 group-hover:opacity-100">
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Lógica de Status e QR Code Centralizada */}
                    <div className="flex flex-col items-center py-10 bg-black/40 rounded-3xl border border-white/5">
                      {instance.status === 'connected' ? (
                        <div className="text-center">
                          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mb-6 mx-auto border border-success/20">
                            <CheckCircle size={40} className="text-success" />
                          </div>
                          <p className="font-black text-success uppercase text-sm tracking-[0.2em]">Conectado</p>
                        </div>
                      ) : instance.qrCode ? (
                        <div className="text-center">
                          <div className="bg-white p-4 rounded-3xl inline-block mb-6 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                            <img src={instance.qrCode} alt="QR Code de Conexão" className="w-48 h-48" />
                          </div>
                          <p className="text-[10px] text-muted font-black uppercase tracking-[0.2em]">Escaneie para Conectar</p>
                        </div>
                      ) : (
                        <div className="text-center w-full px-10">
                          {instance.status === 'connecting' ? (
                            <div className="flex flex-col items-center">
                              <Loader2 className="animate-spin text-primary mb-6" size={40} />
                              <p className="text-[10px] font-black text-muted uppercase tracking-[0.2em]">Sincronizando Core...</p>
                            </div>
                          ) : (
                            <UIButton onClick={() => connectInstance(instance.id)} style={{ width: '100%', height: '64px' }}>
                              GERAR QR CODE DE ACESSO
                            </UIButton>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </UICard>

        {/* COLUNA DIREITA: OUTRAS CONFIGURAÇÕES E LOGS */}
        <div className="space-y-8">
          <UICard title="Integrações API" icon={Globe}>
            <p className="text-muted text-base leading-relaxed mb-8">Sincronize seus disparos estratégicos com plataformas externas (HubSpot, RD Station).</p>
            <UIButton variant="danger" style={{ width: '100%', opacity: 0.3, cursor: 'not-allowed' }}>
              CONFIGURAÇÕES AVANÇADAS (EM BREVE)
            </UIButton>
          </UICard>

          <UICard title="Segurança da Conta" icon={Lock}>
            <p className="text-muted text-base leading-relaxed mb-8">Proteja sua operação com autenticação de dois fatores e logs de acesso.</p>
            <UIButton variant="danger" style={{ width: '100%', opacity: 0.3, cursor: 'not-allowed' }}>
              MÓDULOS DE ACESSO (EM BREVE)
            </UIButton>
          </UICard>

          <UICard title="Console do Servidor" icon={Server}>
            <div className="bg-black/60 p-6 rounded-2xl font-mono text-xs text-success/70 leading-relaxed border border-white/5 h-40 overflow-y-auto">
              [SYSTEM] WhatsApp Core v2.1.0 inicializado.<br/>
              [SYSTEM] Gateway Principal: Conectado.<br/>
              [SYSTEM] Banco de Dados: Sincronizado.<br/>
              [SYSTEM] Aguardando novas instâncias...<br/>
              [05:12:01] Monitoramento de rede ativo.
            </div>
          </UICard>
        </div>
      </div>
    </div>
  );
};

export default Settings;
