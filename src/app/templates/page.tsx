'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  X,
  FileText,
  Copy,
  Tag as TagIcon
} from 'lucide-react';
import { useContacts } from '../../lib/ContactContext';

const Templates = () => {
  const { templates, addTemplate, deleteTemplate, customTags } = useContacts();
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleSave = () => {
    if (!newName || !newContent) return;
    addTemplate({ name: newName, content: newContent });
    setNewName('');
    setNewContent('');
    setShowModal(false);
  };

  const insertTag = (tag: string) => {
    setNewContent(prev => prev + `{{${tag}}}`);
  };

  return (
    <div className="templates-page">
      <div className="page-header">
        <div>
          <h1>Modelos <span className="text-primary">Master</span></h1>
          <p className="text-muted text-lg font-medium mt-2">Engenharia de mensagens para conversão em massa.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Criar Template
        </button>
      </div>

      {/* Modal de Criação */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px', padding: 0, overflow: 'hidden' }}>
            <div className="card-header-unified">
              <div className="card-title-group">
                <div className="card-icon-box"><MessageSquare size={20} /></div>
                <h3>Novo Modelo Estratégico</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="card-inner space-y-8">
              <div className="input-group">
                <label>Identificação do Modelo</label>
                <input 
                  type="text" 
                  placeholder="Ex: Recuperação de Carrinho" 
                  className="mb-0"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Conteúdo da Mensagem</label>
                <textarea 
                  rows={6}
                  placeholder="Olá {{nome}}, vimos que você esqueceu seus itens..." 
                  value={newContent}
                  style={{ fontSize: '1rem', lineHeight: '1.6', padding: '1.25rem' }}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-4 text-[10px] font-black text-muted uppercase tracking-widest">
                  <TagIcon size={12} className="text-primary" /> Inserir Variáveis
                </label>
                <div className="flex flex-wrap gap-2">
                  {customTags.map((tag) => (
                    <button 
                      key={tag}
                      onClick={() => insertTag(tag)}
                      className="px-4 py-2 bg-black rounded-xl border border-white/5 text-xs font-black text-primary hover:bg-primary hover:text-white transition-all"
                    >
                      {'{'}{'{'}{tag}{'}'}{'}'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-white/5">
                <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border)' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn-primary" onClick={handleSave}>Salvar Modelo</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
        {templates.length === 0 ? (
          <div className="card col-span-full">
            <div className="empty-state py-20">
              <FileText size={48} className="empty-state-icon" />
              <p>Nenhum modelo criado</p>
            </div>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="card group">
              <div className="card-header-unified">
                <div className="card-title-group">
                  <div className="card-icon-box"><MessageSquare size={18} /></div>
                  <h3 className="text-base">{template.name}</h3>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => deleteTemplate(template.id)} className="p-2 text-muted hover:text-error">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="card-inner">
                <div className="p-5 bg-black/20 rounded-xl border border-white/5 text-sm text-muted leading-relaxed font-medium min-h-[100px]">
                  {template.content}
                </div>
                <div className="mt-6 flex justify-between items-center text-[10px] text-muted font-black uppercase opacity-40">
                  <span>{template.content.length} caracteres</span>
                  <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Templates;
