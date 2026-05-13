'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  X,
  FileText
} from 'lucide-react';
import { useContacts } from '../../lib/ContactContext';

const Templates = () => {
  const { templates, addTemplate, deleteTemplate } = useContacts();
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

  return (
    <div className="templates-page">
      <div className="card-header mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-3xl font-extrabold">Modelos de <span style={{ color: 'var(--primary)' }}>Conversa</span></h1>
          <p className="text-muted">Mensagens padronizadas para seus disparos.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Novo Modelo
        </button>
      </div>

      {/* Modal de Criação */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-6" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 className="text-xl font-bold">Criar Novo Modelo</h3>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-white">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-muted mb-2 block">Nome do Modelo</label>
                <input 
                  type="text" 
                  placeholder="Ex: Boas-vindas" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-muted mb-2 block">Conteúdo da Mensagem</label>
                <textarea 
                  rows={6}
                  placeholder="Olá {{nome}}, tudo bem?..." 
                  value={newContent}
                  style={{ height: '150px' }}
                  onChange={(e) => setNewContent(e.target.value)}
                />
                <p className="text-[10px] text-muted mt-1">Use as tags: <b>{'{{nome}}'}</b> e <b>{'{{telefone}}'}</b></p>
              </div>

              <div className="flex justify-end gap-3 pt-4" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border)' }} onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn-primary" onClick={handleSave}>Salvar Template</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {templates.length === 0 ? (
          <div className="card text-center py-20 col-span-full" style={{ gridColumn: '1 / -1' }}>
            <FileText size={48} className="mx-auto opacity-10 mb-4" />
            <p className="text-muted">Nenhum modelo cadastrado ainda.</p>
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="card">
              <div className="flex justify-between items-start mb-4" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MessageSquare size={16} className="text-primary" />
                  <h4 className="font-bold">{template.name}</h4>
                </div>
                <button onClick={() => deleteTemplate(template.id)} className="text-muted hover:text-error">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-3 bg-black/40 rounded-lg border border-white/5 text-sm text-muted">
                {template.content}
              </div>
              <div className="mt-4 text-[10px] text-muted font-bold uppercase">
                Criado em {new Date(template.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Templates;
