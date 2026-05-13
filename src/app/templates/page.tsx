'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useContacts } from '../../lib/ContactContext';

const Templates = () => {
  const { templates, addTemplate, deleteTemplate } = useContacts();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleSave = () => {
    if (!newName || !newContent) return;
    addTemplate({ name: newName, content: newContent });
    setNewName('');
    setNewContent('');
    setIsAdding(false);
  };

  return (
    <div className="templates-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Modelos de <span className="gradient-text">Mensagem</span></h1>
          <p>Crie e gerencie versões de mensagens para suas campanhas.</p>
        </div>
        <button className="btn-primary gradient-bg" onClick={() => setIsAdding(true)}>
          <Plus size={18} />
          Novo Modelo
        </button>
      </header>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="add-template-form glass mb-8"
          style={{ padding: '2rem' }}
        >
          <h3>Criar Novo Modelo</h3>
          <div className="form-group mb-4">
            <label className="block mb-2 text-sm font-semibold text-muted">Nome do Modelo</label>
            <input 
              type="text" 
              className="w-full"
              placeholder="Ex: Promoção de Boas Vindas" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="form-group mb-4">
            <label className="block mb-2 text-sm font-semibold text-muted">Conteúdo da Mensagem</label>
            <textarea 
              className="w-full"
              placeholder="Olá {{nome}}, seja bem-vindo!..." 
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <div className="variables-hint mt-2 text-xs text-muted">
              Tags: <code>{'{{nome}}'}</code>, <code>{'{{telefone}}'}</code>
            </div>
          </div>
          <div className="form-actions flex justify-end gap-4">
            <button className="btn-secondary" onClick={() => setIsAdding(false)}>Cancelar</button>
            <button className="btn-primary gradient-bg" onClick={handleSave}>Salvar Modelo</button>
          </div>
        </motion.div>
      )}

      <div className="templates-grid">
        {templates.length === 0 ? (
          <div className="empty-state glass w-full flex flex-col items-center py-12">
            <FileText size={48} opacity={0.2} />
            <p className="mt-4">Você ainda não tem modelos de mensagem.</p>
          </div>
        ) : (
          templates.map((template) => (
            <motion.div key={template.id} layout className="template-card glass">
              <div className="template-header flex justify-between items-center">
                <div className="template-info flex items-center gap-3">
                  <MessageSquare size={16} color="var(--primary)" />
                  <h4>{template.name}</h4>
                </div>
                <button title="Excluir" className="text-muted hover:text-error" onClick={() => deleteTemplate(template.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="template-preview mt-4">
                {template.content}
              </div>
              <div className="template-footer mt-4 text-xs text-muted">
                Criado em: {new Date(template.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Templates;
