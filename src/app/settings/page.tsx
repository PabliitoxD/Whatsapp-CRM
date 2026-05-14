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

  // Auto-abre o modal se vier redirecionado com o parâmetro 'new'
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === 'true') {
      setIsAdding(true);
    }
  }, []);

  // Monitoramento de Sockets para QR Code e Status de Conexão
  useEffect(() => {
    const newSocket = io({ 
      path: '/socket.io-custom',
      transports: ['polling', 'websocket'],
      secure: true
    });
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
    const id = addInstance(newName);
    connectInstance(id);
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                  <UIButton variant="danger" onClick={() => setIsAdding(false)} style={{ background: 'transparent' }}>Cancelar</UIButton>
                  <UIButton onClick={handleAdd} style={{ padding: '1.25rem 3rem' }}>Criar Instância</UIButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

            {instances.length === 0 ? (
              <div className="empty-state" style={{ padding: '5rem 0' }}>
                <Smartphone size={56} className="empty-state-icon" />
                <p className="font-black opacity-30">Sem instâncias cadastradas.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {instances.map((instance) => (
                  <div key={instance.id} style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--border)', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div className="card-icon-box"><Smartphone size={20} /></div>
                        <div>
                          <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.02em', display: 'block' }}>{instance.name}</span>
                          <span style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.15em', marginTop: '0.25rem', display: 'block' }}>UUID: {instance.id.slice(0,8)}</span>
                        </div>
                      </div>
                      <button onClick={() => handleDelete(instance.id)} style={{ padding: '0.75rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }} className="hover:text-error">
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Lógica de Status e QR Code Centralizada */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '20px', border: '1px solid var(--border)' }}>
                      {instance.status === 'connected' ? (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ width: '80px', height: '80px', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', margin: '0 auto', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <CheckCircle size={40} style={{ color: 'var(--success)' }} />
                          </div>
                          <p style={{ fontWeight: 900, color: 'var(--success)', textTransform: 'uppercase', fontSize: '0.875rem', letterSpacing: '0.2em' }}>Conectado</p>
                        </div>
                      ) : instance.qrCode ? (
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ background: 'white', padding: '1rem', borderRadius: '24px', display: 'inline-block', marginBottom: '1.5rem', boxShadow: '0 0 50px rgba(255,255,255,0.05)' }}>
                            <img src={instance.qrCode} alt="QR Code de Conexão" style={{ width: '192px', height: '192px' }} />
                          </div>
                          <p style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Escaneie para Conectar</p>
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', width: '100%' }}>
                          {instance.status === 'connecting' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <div className="loader-spin" style={{ width: '40px', height: '40px', border: '3px solid rgba(139, 92, 246, 0.1)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1.5rem' }}></div>
                              <p style={{ fontSize: '0.625rem', fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Sincronizando Core...</p>
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
