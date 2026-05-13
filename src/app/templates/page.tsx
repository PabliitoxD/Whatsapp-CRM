'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3,
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
          className="add-template-form glass"
        >
          <h3>Criar Novo Modelo</h3>
          <div className="form-group">
            <label>Nome do Modelo</label>
            <input 
              type="text" 
              placeholder="Ex: Promoção de Boas Vindas" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Conteúdo da Mensagem</label>
            <textarea 
              placeholder="Olá {{nome}}, seja bem-vindo!..." 
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
            />
            <div className="variables-hint">
              Tags: <code>{'{{nome}}'}</code>, <code>{'{{telefone}}'}</code>
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-secondary" onClick={() => setIsAdding(false)}>Cancelar</button>
            <button className="btn-primary gradient-bg" onClick={handleSave}>Salvar Modelo</button>
          </div>
        </motion.div>
      )}

      <div className="templates-grid">
        {templates.length === 0 ? (
          <div className="empty-state glass">
            <FileText size={48} opacity={0.2} />
            <p>Você ainda não tem modelos de mensagem.</p>
          </div>
        ) : (
          templates.map((template) => (
            <motion.div key={template.id} layout className="template-card glass">
              <div className="template-header">
                <div className="template-info">
                  <MessageSquare size={16} color="var(--primary)" />
                  <h4>{template.name}</h4>
                </div>
                <div className="template-actions">
                  <button title="Excluir" onClick={() => deleteTemplate(template.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="template-preview">
                {template.content}
              </div>
              <div className="template-footer">
                Criado em: {new Date(template.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))
        )}
      </div>

      <style jsx>{`
        .templates-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .add-template-form {
          padding: 2rem;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .form-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.6);
        }

        input, textarea {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          padding: 0.875rem 1rem;
          color: white;
          outline: none;
          transition: var(--transition);
        }

        textarea {
          min-height: 120px;
          resize: vertical;
        }

        .variables-hint {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.4);
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }

        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .template-card {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .template-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .template-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .template-preview {
          background: rgba(0, 0, 0, 0.2);
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.7);
          white-space: pre-wrap;
          max-height: 150px;
          overflow-y: auto;
        }

        .template-footer {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.3);
        }

        .empty-state {
          grid-column: 1 / -1;
          padding: 4rem;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          color: rgba(255, 255, 255, 0.2);
        }

        .template-actions button {
          color: rgba(255, 255, 255, 0.4);
          transition: var(--transition);
        }

        .template-actions button:hover {
          color: var(--error);
        }
      `}</style>
    </div>
  );
};

export default Templates;
