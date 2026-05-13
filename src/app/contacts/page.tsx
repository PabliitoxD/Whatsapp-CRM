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
      <div className="card-header mb-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-4xl font-black">Audiência <span style={{ color: 'var(--primary)' }}>Master</span></h1>
          <p className="text-muted text-lg mt-2">Gerencie seus leads e personalize variáveis dinâmicas.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn-primary" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)' }} onClick={clearContacts}>
            <Trash2 size={18} /> Limpar Tudo
          </button>
          <label className="btn-primary cursor-pointer mb-0">
            <Upload size={18} /> Importar Leads
            <input type="file" hidden accept=".csv,.txt" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      <div className="grid-2">
        {/* Coluna 1: Gestão de Tags */}
        <div className="card">
          <div className="card-header border-b border-white/5 pb-6 mb-8">
            <h3 className="card-title flex items-center gap-3"><Tag size={22} className="text-primary" /> Variáveis Dinâmicas</h3>
          </div>
          
          <div className="mb-10">
            <label>Criar Nova Tag</label>
            <div className="flex gap-3">
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 800 }}>{'{'}{'{'}</span>
                <input 
                  type="text" 
                  placeholder="exemplo" 
                  value={newTag}
                  className="mb-0"
                  style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <span style={{ position: 'absolute', right: '1rem', top: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 800 }}>{'}'}{'}'}</span>
              </div>
              <button className="btn-primary" style={{ padding: '0 1.25rem' }} onClick={handleAddTag}>
                <Plus size={24} />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <label>Tags Disponíveis</label>
            <div className="flex flex-wrap gap-3">
              {customTags.map((tag) => (
                <div key={tag} className="flex items-center gap-3 px-4 py-2 bg-black rounded-xl border border-white/10 text-sm group hover:border-primary/50 transition-all">
                  <span className="font-black text-primary tracking-tight">{'{'}{'{'}{tag}{'}'}{'}'}</span>
                  {tag !== 'nome' && tag !== 'telefone' && (
                    <button onClick={() => deleteCustomTag(tag)} className="text-muted hover:text-error transition-colors">
                      <X size={14} />
                    </button>
                  )}
                  {(tag === 'nome' || tag === 'telefone') && (
                    <CheckCircle2 size={14} className="text-success opacity-50" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna 2: Lista de Contatos */}
        <div className="space-y-8">
          <div className="card">
            <div className="flex items-center gap-4">
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={20} style={{ position: 'absolute', left: '1.25rem', top: '1.1rem', opacity: 0.3 }} />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome ou telefone..." 
                  className="pl-14 mb-0"
                  style={{ paddingLeft: '3.5rem', marginBottom: 0 }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
                <Filter size={20} />
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: '1rem' }}>
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
                      <td colSpan={4} className="text-center py-24 opacity-30 text-muted italic">
                        Nenhum contato encontrado.
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-white/[0.01] transition-colors">
                        <td>
                          <div className="flex items-center gap-4">
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.85rem' }}>
                              {contact.name.charAt(0)}
                            </div>
                            <span className="font-bold text-base">{contact.name}</span>
                          </div>
                        </td>
                        <td className="font-mono text-muted text-sm">{contact.phone}</td>
                        <td>
                          <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-success/10 text-success border border-success/20 uppercase tracking-widest">
                            {contact.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="p-2 text-muted hover:text-error transition-colors" onClick={() => deleteContact(contact.id)}>
                            <Trash2 size={18} />
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
