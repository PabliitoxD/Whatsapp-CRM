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
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black uppercase text-muted tracking-widest">Inserir Variáveis Dinâmicas</p>
                    <span className="text-[10px] text-primary opacity-50 font-bold">CLIQUE PARA INSERIR</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {customTags.map((tag) => (
                      <button 
                        key={tag}
                        type="button"
                        onClick={() => insertTag(tag)}
                        className="px-4 py-2.5 bg-black/40 rounded-xl border border-white/5 text-xs font-black text-primary hover:bg-primary hover:text-white transition-all"
                      >
                        {'{'}{'{'}{tag}{'}'}{'}'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Botões de Ação do Modal */}
                <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
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
          <div className="col-span-full">
            <UICard title="Repositório de Estratégias" icon={FileText}>
              <div className="empty-state py-20">
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
                  <button onClick={() => deleteTemplate(template.id)} className="p-3 text-muted hover:text-error transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 size={20} />
                  </button>
                }
              >
                <div className="p-6 bg-black/20 rounded-2xl border border-white/5 text-base text-muted leading-relaxed min-h-[140px] font-medium">
                  {template.content}
                </div>
                <div className="mt-8 flex justify-between items-center text-[10px] text-muted font-black uppercase tracking-widest opacity-40">
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
