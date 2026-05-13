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
      <div className="card-header mb-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-4xl font-black">Modelos de <span style={{ color: 'var(--primary)' }}>Conversa</span></h1>
          <p className="text-muted mt-2">Padronize sua comunicação e aumente sua taxa de conversão.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Novo Modelo
        </button>
      </div>

      {/* Modal de Criação */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="flex justify-between items-center mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-2xl font-black">Criar Modelo</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-white p-2 hover:bg-white/5 rounded-lg transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase text-muted mb-2 block">Nome de Identificação</label>
                <input 
                  type="text" 
                  placeholder="Ex: Recuperação de Carrinho - 1h" 
                  className="mb-0"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-[10px] font-bold uppercase text-muted block">Conteúdo da Mensagem</label>
                  <span className="text-[10px] text-muted opacity-50">{newContent.length} caracteres</span>
                </div>
                <textarea 
                  rows={8}
                  placeholder="Olá {{nome}}, vimos que você esqueceu seus itens..." 
                  value={newContent}
                  style={{ height: '200px', fontSize: '0.95rem', lineHeight: '1.6' }}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-muted mb-3 block flex items-center gap-2">
                  <TagIcon size={12} /> Tags Disponíveis (Clique para inserir)
                </label>
                <div className="flex flex-wrap gap-2" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {customTags.map((tag) => (
                    <button 
                      key={tag}
                      onClick={() => insertTag(tag)}
                      className="px-3 py-1.5 bg-black rounded-lg border border-white/5 text-[10px] font-bold text-primary hover:bg-primary/10 transition-all"
                    >
                      {'{'}{'{'}{tag}{'}'}{'}'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-white/5" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border)' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn-primary" onClick={handleSave}>Salvar Template</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
        {templates.length === 0 ? (
          <div className="card text-center py-24 col-span-full" style={{ gridColumn: '1 / -1' }}>
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText size={32} className="opacity-20" />
            </div>
            <h3 className="text-xl font-bold opacity-30">Nenhum modelo estratégico</h3>
            <p className="text-muted opacity-30 mt-2">Clique em "Novo Modelo" para começar.</p>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="card group hover:border-primary/30 transition-all">
              <div className="flex justify-between items-start mb-6" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <MessageSquare size={16} />
                  </div>
                  <h4 className="font-bold text-sm tracking-tight">{template.name}</h4>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-white/5 rounded-lg text-muted">
                    <Copy size={16} />
                  </button>
                  <button onClick={() => deleteTemplate(template.id)} className="p-2 hover:bg-error/10 rounded-lg text-muted hover:text-error">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4 bg-black/40 rounded-xl border border-white/5 text-sm text-muted leading-relaxed font-medium">
                {template.content}
              </div>
              <div className="mt-6 flex justify-between items-center text-[10px] text-muted font-bold uppercase tracking-widest opacity-40">
                <span>Criado em {new Date(template.createdAt).toLocaleDateString()}</span>
                <span>{template.content.length} CH</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Templates;
