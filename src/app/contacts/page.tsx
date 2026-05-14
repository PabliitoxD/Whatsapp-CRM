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
  CheckCircle2
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
      <div className="page-header mb-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 className="text-5xl font-black mb-4">Audiência <span style={{ color: 'var(--primary)' }}>Master</span></h1>
          <p className="text-muted text-xl">Gestão estratégica de leads e variáveis de personalização.</p>
        </div>
        <div className="flex gap-6" style={{ display: 'flex', gap: '1.5rem' }}>
          <button className="btn-primary" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)', minWidth: '220px' }} onClick={clearContacts}>
            <Trash2 size={22} /> Limpar Base
          </button>
          <label className="btn-primary cursor-pointer mb-0" style={{ minWidth: '240px' }}>
            <Upload size={22} /> Importar Leads
            <input type="file" hidden accept=".csv,.txt" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      <div className="grid-2 mt-12">
        {/* Coluna 1: Gestão de Tags */}
        <div className="card">
          <div className="card-header border-b border-white/5 pb-8 mb-10">
            <h3 className="card-title flex items-center gap-4"><Tag size={28} className="text-primary" /> Variáveis Dinâmicas</h3>
          </div>
          
          <div className="mb-12">
            <label>Criar Nova Tag Estratégica</label>
            <div className="flex gap-4" style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '1.5rem', top: '1.5rem', color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 900 }}>{'{'}{'{'}</span>
                <input 
                  type="text" 
                  placeholder="exemplo" 
                  value={newTag}
                  className="mb-0"
                  style={{ paddingLeft: '4rem', paddingRight: '4rem' }}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <span style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 900 }}>{'}'}{'}'}</span>
              </div>
              <button className="btn-primary" style={{ padding: '0 2rem' }} onClick={handleAddTag}>
                <Plus size={32} />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <label>Tags Ativas no Sistema</label>
            <div className="flex flex-wrap gap-4" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {customTags.map((tag) => (
                <div key={tag} className="flex items-center gap-4 px-6 py-3 bg-black rounded-2xl border border-white/10 text-sm group hover:border-primary/50 transition-all">
                  <span className="font-black text-primary text-base tracking-tight">{'{'}{'{'}{tag}{'}'}{'}'}</span>
                  {tag !== 'nome' && tag !== 'telefone' && (
                    <button onClick={() => deleteCustomTag(tag)} className="text-muted hover:text-error transition-colors">
                      <X size={18} />
                    </button>
                  )}
                  {(tag === 'nome' || tag === 'telefone') && (
                    <CheckCircle2 size={18} className="text-success opacity-50" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna 2: Lista de Contatos */}
        <div className="space-y-12">
          <div className="card">
            <div className="flex items-center gap-6" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={24} style={{ position: 'absolute', left: '1.5rem', top: '1.5rem', opacity: 0.3 }} />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome ou telefone..." 
                  className="pl-20 mb-0"
                  style={{ paddingLeft: '4.5rem', marginBottom: 0 }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', padding: '1.5rem' }}>
                <Filter size={24} />
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Lead</th>
                    <th>Telefone</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-32 opacity-20 text-muted italic text-xl font-bold">
                        Sua base de leads está vazia.
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-white/[0.02] transition-colors">
                        <td>
                          <div className="flex items-center gap-5" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '1.2rem' }}>
                              {contact.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-lg tracking-tight">{contact.name}</p>
                              <p className="text-xs text-muted font-bold uppercase tracking-widest mt-1">Lead ID: {contact.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="font-mono text-muted text-base">{contact.phone}</td>
                        <td>
                          <span className="text-xs font-black px-4 py-2 rounded-full bg-success/10 text-success border border-success/20 uppercase tracking-widest">
                            {contact.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="p-3 text-muted hover:text-error transition-colors" onClick={() => deleteContact(contact.id)}>
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
    </div>
  );
};

export default Contacts;
