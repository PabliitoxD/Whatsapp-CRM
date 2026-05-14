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
      <div className="page-header mb-12 flex justify-between items-end pb-8 border-b border-white/5">
        <div>
          <h1 className="text-5xl font-black mb-4">Modelos <span style={{ color: 'var(--primary)' }}>Master</span></h1>
          <p className="text-muted text-xl mt-2">Engenharia de mensagens para conversão em massa.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={24} /> Criar Template Estratégico
        </button>
      </div>

      {/* Modal de Criação */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '900px' }}>
            <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <MessageSquare size={32} />
                </div>
                <div>
                  <h3 className="text-4xl font-black tracking-tight">Novo Modelo</h3>
                  <p className="text-muted font-bold uppercase text-[10px] tracking-widest mt-1">Defina sua estratégia de comunicação</p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-white p-4 hover:bg-white/5 rounded-2xl transition-all">
                <X size={36} />
              </button>
            </div>

            <div className="space-y-10">
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
                <div className="flex justify-between items-end mb-4">
                  <label>Conteúdo da Mensagem Estratégica</label>
                  <span className="text-[10px] font-black text-muted opacity-50 uppercase tracking-widest">{newContent.length} caracteres digitados</span>
                </div>
                <textarea 
                  rows={8}
                  placeholder="Olá {{nome}}, vimos que você esqueceu seus itens..." 
                  value={newContent}
                  style={{ height: '280px', fontSize: '1.1rem', lineHeight: '1.8', padding: '2.5rem' }}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-3 mb-6">
                  <TagIcon size={18} className="text-primary" /> Variáveis Disponíveis (Clique para inserir)
                </label>
                <div className="flex flex-wrap gap-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {customTags.map((tag) => (
                    <button 
                      key={tag}
                      onClick={() => insertTag(tag)}
                      className="px-6 py-3 bg-black rounded-2xl border border-white/5 text-sm font-black text-primary hover:bg-primary hover:text-white transition-all shadow-lg"
                    >
                      {'{'}{'{'}{tag}{'}'}{'}'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-6 pt-10 border-t border-white/5" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem' }}>
                <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border)', minWidth: '180px' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn-primary px-16" onClick={handleSave}>Salvar Template</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: '4rem' }}>
        {templates.length === 0 ? (
          <div className="card text-center py-48 col-span-full">
            <div className="w-24 h-24 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto mb-10">
              <FileText size={48} className="opacity-10" />
            </div>
            <h3 className="text-3xl font-black opacity-20 uppercase tracking-widest">Nenhuma Estratégia Ativa</h3>
            <p className="text-muted opacity-20 mt-4 text-lg font-medium">Inicie sua automação criando seu primeiro modelo de mensagem.</p>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="card group hover:border-primary/40 transition-all">
              <div className="flex justify-between items-start mb-10" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-primary/10 rounded-2xl text-primary border border-primary/10">
                    <MessageSquare size={24} />
                  </div>
                  <h4 className="font-black text-xl tracking-tight">{template.name}</h4>
                </div>
                <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                  <button className="p-3.5 hover:bg-white/5 rounded-2xl text-muted">
                    <Copy size={22} />
                  </button>
                  <button onClick={() => deleteTemplate(template.id)} className="p-3.5 hover:bg-error/10 rounded-2xl text-muted hover:text-error transition-colors">
                    <Trash2 size={22} />
                  </button>
                </div>
              </div>
              <div className="p-8 bg-black/40 rounded-[32px] border border-white/5 text-lg text-muted leading-relaxed font-medium min-h-[160px]">
                {template.content}
              </div>
              <div className="mt-10 flex justify-between items-center text-[11px] text-muted font-black uppercase tracking-widest opacity-40">
                <span className="flex items-center gap-3"><TagIcon size={14} /> {template.content.length} CH</span>
                <span>Registrado em {new Date(template.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Templates;
