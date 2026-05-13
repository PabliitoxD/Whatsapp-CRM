'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  FileText,
  Copy,
  CheckCircle2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <header className="page-header flex justify-between items-center">
        <div>
          <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            Modelos de <span className="gradient-text">Conversa</span>
          </motion.h1>
          <p>Maximize sua conversão com mensagens padronizadas.</p>
        </div>
        <button className="btn-primary gradient-bg" onClick={() => setIsAdding(true)}>
          <Plus size={18} />
          <span className="hidden sm:inline">Criar Template</span>
        </button>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
          >
            <div className="glass w-full max-w-2xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-extrabold tracking-tight">Novo Template</h3>
                <button onClick={() => setIsAdding(false)} className="text-white/40 hover:text-white">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">Identificação do Modelo</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Recuperação de Carrinho - 24h" 
                    value={newName}
                    className="w-full bg-black/20 border-white/10"
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-widest opacity-40">Conteúdo Estratégico</label>
                  <textarea 
                    placeholder="Olá {{nome}}, vimos que você deixou algo especial..." 
                    value={newContent}
                    className="w-full min-h-[200px] bg-black/20 border-white/10"
                    onChange={(e) => setNewContent(e.target.value)}
                  />
                  <div className="flex gap-4 mt-2">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded">{'{{nome}}'}</span>
                    <span className="text-[10px] font-bold text-accent bg-accent/10 px-2 py-1 rounded">{'{{telefone}}'}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
                  <button className="btn-secondary" onClick={() => setIsAdding(false)}>Descartar</button>
                  <button className="btn-primary gradient-bg" onClick={handleSave}>Salvar Modelo</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="templates-grid mt-12">
        {templates.length === 0 ? (
          <div className="empty-state glass w-full py-32 text-center col-span-full">
            <FileText size={64} className="mx-auto mb-6 opacity-5" />
            <p className="text-lg font-bold opacity-30">Nenhum modelo estratégico criado.</p>
          </div>
        ) : (
          templates.map((template, i) => (
            <motion.div 
              key={template.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="template-card glass group"
            >
              <div className="card-header p-6 flex justify-between items-center bg-white/[0.01]">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MessageSquare size={18} className="text-primary" />
                  </div>
                  <h4 className="font-bold text-sm tracking-tight">{template.name}</h4>
                </div>
                <button 
                  className="p-2 text-white/20 hover:text-error hover:bg-error/10 rounded-lg transition-all" 
                  onClick={() => deleteTemplate(template.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-6">
                <div className="template-preview bg-black/20 p-5 rounded-2xl border border-white/5 text-sm leading-relaxed text-white/60 font-medium">
                  {template.content}
                </div>
                <div className="flex justify-between items-center mt-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">
                    Criado em: {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                  <button className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-widest text-primary hover:text-white transition-colors">
                    <Copy size={12} /> Copiar
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <style jsx>{`
        .templates-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 2rem;
        }
      `}</style>
    </div>
  );
};

export default Templates;
