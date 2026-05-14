'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Upload, 
  Trash2, 
  Search,
  Filter,
  Plus,
  Tag,
  X,
  CheckCircle2,
  Database
} from 'lucide-react';
import { useContacts } from '../../lib/ContactContext';

const Contacts = () => {
  const { 
    contacts, 
    addContacts, 
    deleteContact, 
    clearContacts, 
    customTags, 
    addCustomTag, 
    deleteCustomTag 
  } = useContacts();
  const [searchTerm, setSearchTerm] = useState('');
  const [newTag, setNewTag] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newContacts = lines
        .map(line => {
          const parts = line.split(',');
          const name = parts[0]?.trim();
          const phone = parts[1]?.trim();
          if (name && phone) {
            const cleanPhone = phone.replace(/\D/g, '');
            return { name, phone: cleanPhone, status: 'Ativo' as const };
          }
          return null;
        })
        .filter((c): c is { name: string, phone: string, status: 'Ativo' } => c !== null);
      
      addContacts(newContacts);
    };
    reader.readAsText(file);
  };

  const handleAddTag = () => {
    if (!newTag) return;
    addCustomTag(newTag);
    setNewTag('');
  };

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="contacts-page">
      {/* Header Superior do Painel */}
      <div className="page-header mb-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '3rem', borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 className="text-5xl font-extrabold tracking-tighter mb-4">Audiência <span style={{ color: 'var(--primary)' }}>Master</span></h1>
          <p className="text-muted text-xl font-medium">Gestão centralizada de leads e tags inteligentes.</p>
        </div>
        <div className="flex gap-6" style={{ display: 'flex', gap: '1.5rem' }}>
          <button className="btn-primary" style={{ background: 'rgba(239, 68, 68, 0.05)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.1)', minWidth: '220px' }} onClick={clearContacts}>
            <Trash2 size={20} /> Limpar Base
          </button>
          <label className="btn-primary cursor-pointer mb-0" style={{ minWidth: '240px' }}>
            <Upload size={20} /> Importar Novos Leads
            <input type="file" hidden accept=".csv,.txt" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      <div className="grid-2">
        {/* LADO ESQUERDO: TAGS */}
        <div className="card">
          <div className="card-header border-b border-white/5 pb-8 mb-12">
            <h3 className="card-title flex items-center gap-4"><Tag size={28} className="text-primary" /> Tags de Automação</h3>
          </div>
          
          <div className="mb-12">
            <label className="mb-4 block">Nova Tag Dinâmica</label>
            <div className="flex gap-3" style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '1.5rem', top: '1.5rem', color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 900 }}>{'{'}{'{'}</span>
                <input 
                  type="text" 
                  placeholder="ex: empresa" 
                  value={newTag}
                  className="mb-0"
                  style={{ paddingLeft: '4rem', paddingRight: '4rem' }}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <span style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 900 }}>{'}'}{'}'}</span>
              </div>
              <button className="btn-primary" style={{ padding: '0 1.5rem', height: 'auto' }} onClick={handleAddTag}>
                <Plus size={28} />
              </button>
            </div>
          </div>

          <div>
            <label className="mb-6 block">Variáveis Ativas</label>
            <div className="grid grid-cols-1 gap-4" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
              {customTags.map((tag) => (
                <div key={tag} className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5 group hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black">
                      {'{'}{'{'}
                    </div>
                    <span className="font-bold text-lg tracking-tight">{tag}</span>
                  </div>
                  {tag !== 'nome' && tag !== 'telefone' ? (
                    <button onClick={() => deleteCustomTag(tag)} className="text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all">
                      <X size={18} />
                    </button>
                  ) : (
                    <CheckCircle2 size={18} className="text-success" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* LADO DIREITO: BUSCA + LISTA (UNIFICADO NO MESMO CARD) */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Cabeçalho da Lista com Busca */}
          <div className="p-12 border-b border-white/5 bg-white/[0.01]">
            <div className="flex justify-between items-center mb-10">
              <h3 className="card-title flex items-center gap-4"><Users size={28} className="text-primary" /> Lista de Leads</h3>
              <span className="bg-primary/10 text-primary text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest border border-primary/20">
                {contacts.length} Contatos
              </span>
            </div>

            <div className="flex gap-6" style={{ display: 'flex', gap: '1.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={22} style={{ position: 'absolute', left: '1.5rem', top: '1.5rem', opacity: 0.3 }} />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome ou telefone..." 
                  className="mb-0"
                  style={{ paddingLeft: '4.5rem' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '0 2rem' }}>
                <Filter size={24} />
              </button>
            </div>
          </div>

          {/* Tabela de Leads */}
          <div className="table-container">
            <table>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ paddingLeft: '3rem' }}>Lead</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '3rem' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-40">
                      <div className="opacity-10 mb-6">
                        <Database size={64} className="mx-auto" />
                      </div>
                      <p className="text-muted text-xl font-bold italic">Nenhum contato encontrado na sua base.</p>
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors">
                      <td style={{ paddingLeft: '3rem' }}>
                        <div className="flex items-center gap-5" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                          <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                            {contact.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-lg tracking-tight">{contact.name}</p>
                            <p className="text-[10px] text-muted font-black uppercase tracking-widest mt-1">Status: Ativo</p>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono text-muted text-base">{contact.phone}</td>
                      <td>
                        <div className="flex items-center gap-2 text-success font-black text-xs uppercase tracking-widest">
                          <div className="w-2 h-2 bg-success rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                          {contact.status}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '3rem' }}>
                        <button className="p-4 text-muted hover:text-error transition-all hover:bg-error/10 rounded-2xl" onClick={() => deleteContact(contact.id)}>
                          <Trash2 size={22} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
