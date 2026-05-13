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
      <div className="page-header mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black">Modelos de <span style={{ color: 'var(--primary)' }}>Conversa</span></h1>
          <p className="text-muted text-lg mt-2">Padronize sua comunicação e otimize seus resultados.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} /> Criar Template
        </button>
      </div>

      {/* Modal de Criação */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '750px' }}>
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <MessageSquare size={24} />
                </div>
                <h3 className="text-3xl font-black tracking-tight">Novo Modelo</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-white p-3 hover:bg-white/5 rounded-xl transition-all">
                <X size={28} />
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <label>Identificação do Modelo</label>
                <input 
                  type="text" 
                  placeholder="Ex: Recuperação de Carrinho - 1h" 
                  className="mb-0"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>

              <div>
                <div className="flex justify-between items-end mb-3">
                  <label>Conteúdo da Mensagem</label>
                  <span className="text-[10px] font-black text-muted opacity-40 uppercase tracking-widest">{newContent.length} caracteres</span>
                </div>
                <textarea 
                  rows={8}
                  placeholder="Olá {{nome}}, vimos que você esqueceu seus itens..." 
                  value={newContent}
                  style={{ height: '220px', fontSize: '1rem', lineHeight: '1.7', padding: '1.5rem' }}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-4">
                  <TagIcon size={14} className="text-primary" /> Tags Disponíveis
                </label>
                <div className="flex flex-wrap gap-3">
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

              <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
                <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border)' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn-primary px-10" onClick={handleSave}>Salvar Template</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '3rem' }}>
        {templates.length === 0 ? (
          <div className="card text-center py-32 col-span-full">
            <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <FileText size={40} className="opacity-10" />
            </div>
            <h3 className="text-2xl font-black opacity-20 uppercase tracking-widest">Nenhum Modelo Encontrado</h3>
            <p className="text-muted opacity-20 mt-3 font-medium">Crie seu primeiro modelo de mensagem para começar.</p>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="card group hover:border-primary/40 transition-all">
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <MessageSquare size={20} />
                  </div>
                  <h4 className="font-black text-lg tracking-tight">{template.name}</h4>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                  <button className="p-2.5 hover:bg-white/5 rounded-xl text-muted">
                    <Copy size={18} />
                  </button>
                  <button onClick={() => deleteTemplate(template.id)} className="p-2.5 hover:bg-error/10 rounded-xl text-muted hover:text-error transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="p-6 bg-black/40 rounded-2xl border border-white/5 text-base text-muted leading-relaxed font-medium min-h-[120px]">
                {template.content}
              </div>
              <div className="mt-8 flex justify-between items-center text-[10px] text-muted font-black uppercase tracking-widest opacity-30">
                <span className="flex items-center gap-2"><TagIcon size={12} /> {template.content.length} caracteres</span>
                <span>{new Date(template.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Templates;
