'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, Trash2, X, FileText, Tag as TagIcon } from 'lucide-react';
import { useContacts } from '../../lib/ContactContext';
import { PageHeader, UICard, UIButton } from '../../components/UIComponents';

/**
 * PÁGINA: MODELOS (TEMPLATES DE MENSAGEM)
 * 
 * Permite a criação e exclusão de modelos de mensagens estratégicas.
 * Inclui um modal de criação com inserção dinâmica de variáveis (Tags).
 */

const Templates = () => {
  const { templates, addTemplate, deleteTemplate, customTags } = useContacts();
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');

  // Auto-abre o modal se vier redirecionado com o parâmetro 'new'
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('new') === 'true') {
      setShowModal(true);
    }
  }, []);

  // Salva o novo modelo e fecha o modal
  const handleSave = () => {
    if (!newName || !newContent) return;
    addTemplate({ name: newName, content: newContent });
    setNewName('');
    setNewContent('');
    setShowModal(false);
  };

  // Atalho para inserir {{tag}} na posição atual do cursor no textarea
  const insertTag = (tag: string) => {
    const textarea = document.getElementById('template-content') as HTMLTextAreaElement;
    const tagToInsert = `{{${tag}}}`;
    
    if (!textarea) {
      setNewContent(prev => prev + tagToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = newContent;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    
    const updatedContent = before + tagToInsert + after;
    setNewContent(updatedContent);
    
    // Devolve o foco ao textarea após a inserção e posiciona o cursor após a tag
    textarea.focus();
    setTimeout(() => {
      const newPos = start + tagToInsert.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  return (
    <div className="templates-page">
      {/* Cabeçalho com botão de gatilho para o Modal */}
      <PageHeader 
        title="Modelos Master" 
        subtitle="Engenharia de mensagens para conversão em massa e personalização."
      >
        <UIButton onClick={() => setShowModal(true)}>
          <Plus size={20} /> Criar Novo Template
        </UIButton>
      </PageHeader>

      {/* MODAL DE CRIAÇÃO (Overlay fixo) */}
      {showModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '800px', boxShadow: '0 50px 100px rgba(0,0,0,0.8)' }}>
            <div className="card-header-unified" style={{ padding: '2.5rem 3.5rem' }}>
              <div className="card-title-group">
                <div className="card-icon-box"><MessageSquare size={22} /></div>
                <h3>Novo Modelo Estratégico</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-white transition-all">
                <X size={28} />
              </button>
            </div>

            <div className="card-inner" style={{ padding: '3.5rem' }}>
              <div className="space-y-8">
                {/* Nome do Template */}
                <div className="input-group">
                  <label style={{ color: !newName && showModal ? 'var(--text-muted)' : '' }}>Identificação do Modelo</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Recuperação de Carrinho Abandonado" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    style={{ borderColor: !newName && showModal ? 'rgba(255,255,255,0.05)' : '' }}
                  />
                </div>

                {/* Área da Mensagem */}
                <div className="input-group">
                  <label>Conteúdo da Mensagem</label>
                  <textarea 
                    id="template-content"
                    rows={8}
                    placeholder="Digite sua mensagem estratégica..." 
                    style={{ fontSize: '1.1rem', lineHeight: '1.6', borderColor: !newContent && showModal ? 'rgba(255,255,255,0.05)' : '' }}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                </div>

                {/* Seleção de Variáveis (Tags) */}
                <div>
                  <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                    <p className="text-[10px] font-black uppercase text-muted tracking-widest">Inserir Variáveis Dinâmicas</p>
                    <span style={{ fontSize: '10px', color: 'var(--primary)', opacity: 0.5, fontWeight: 700 }}>CLIQUE PARA INSERIR</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {customTags.map((tag) => (
                      <button 
                        key={tag}
                        type="button"
                        onClick={() => insertTag(tag)}
                        style={{ 
                          padding: '0.625rem 1rem',
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255,255,255,0.05)',
                          fontSize: '0.75rem',
                          fontWeight: 900,
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)'; e.currentTarget.style.color = 'var(--primary)'; }}
                      >
                        {'{'}{'{'}{tag}{'}'}{'}'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botões de Ação do Modal */}
                <div className="flex justify-end gap-4" style={{ paddingTop: '2rem', borderTop: '1px solid var(--border)', marginTop: '2rem' }}>
                  <UIButton variant="danger" onClick={() => { setShowModal(false); setNewName(''); setNewContent(''); }} style={{ background: 'transparent' }}>Cancelar</UIButton>
                  <UIButton 
                    onClick={handleSave} 
                    style={{ 
                      padding: '1.25rem 3rem',
                      opacity: !newName || !newContent ? 0.5 : 1,
                      cursor: !newName || !newContent ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Salvar Modelo
                  </UIButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LISTAGEM DE MODELOS EM GRID (Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '2.5rem' }}>
        {templates.length === 0 ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <UICard title="Repositório de Estratégias" icon={FileText}>
              <div className="empty-state" style={{ padding: '5rem 0' }}>
                <FileText size={64} className="empty-state-icon" />
                <p className="font-black opacity-30">Nenhum modelo estratégico criado.</p>
              </div>
            </UICard>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="group">
              <UICard 
                title={template.name} 
                icon={MessageSquare}
                headerAction={
                  <button onClick={() => deleteTemplate(template.id)} style={{ padding: '0.75rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <Trash2 size={20} />
                  </button>
                }
              >
                <div style={{ padding: '1.5rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '20px', border: '1px solid var(--border)', fontSize: '1rem', color: 'var(--text-muted)', lineHeight: '1.6', minHeight: '140px', fontWeight: 500 }}>
                  {template.content}
                </div>
                <div className="flex justify-between items-center" style={{ marginTop: '2rem', fontSize: '10px', color: 'var(--text-muted)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', opacity: 0.4 }}>
                  <span>{template.content.length} caracteres</span>
                  <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                </div>
              </UICard>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Templates;
