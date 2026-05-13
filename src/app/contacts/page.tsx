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
          <h1 className="text-4xl font-black">Audiência & <span style={{ color: 'var(--primary)' }}>Tags</span></h1>
          <p className="text-muted mt-2">Gerencie seus leads e personalize suas variáveis.</p>
        </div>
        <div className="flex gap-4" style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-primary" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.2)' }} onClick={clearContacts}>
            <Trash2 size={18} /> Limpar Base
          </button>
          <label className="btn-primary cursor-pointer">
            <Upload size={18} /> Importar Leads
            <input type="file" hidden accept=".csv,.txt" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      <div className="grid-2">
        {/* Coluna 1: Gestão de Tags */}
        <div className="card">
          <div className="card-header border-b border-white/5 pb-4 mb-6">
            <h3 className="card-title flex items-center gap-2"><Tag size={18} /> Variáveis Dinâmicas</h3>
          </div>
          
          <div className="mb-8">
            <label className="text-[10px] font-bold uppercase text-muted mb-2 block">Criar Nova Tag</label>
            <div className="flex gap-2" style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '0.75rem', top: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{'{'}{'{'}</span>
                <input 
                  type="text" 
                  placeholder="exemplo" 
                  value={newTag}
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <span style={{ position: 'absolute', right: '0.75rem', top: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{'}'}{'}'}</span>
              </div>
              <button className="btn-primary" style={{ padding: '0 1rem' }} onClick={handleAddTag}>
                <Plus size={20} />
              </button>
            </div>
            <p className="text-[10px] text-muted mt-2 italic">Use estas tags nos seus modelos de mensagem.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-muted mb-2 block">Tags Disponíveis</label>
            <div className="flex flex-wrap gap-2" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {customTags.map((tag) => (
                <div key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-black rounded-lg border border-white/10 text-xs group">
                  <span className="font-mono text-primary">{'{'}{'{'}{tag}{'}'}{'}'}</span>
                  {tag !== 'nome' && tag !== 'telefone' && (
                    <button onClick={() => deleteCustomTag(tag)} className="text-muted hover:text-error">
                      <X size={12} />
                    </button>
                  )}
                  {(tag === 'nome' || tag === 'telefone') && (
                    <CheckCircle2 size={12} className="text-success opacity-50" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Coluna 2: Lista de Contatos */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-4" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', top: '0.8rem', opacity: 0.3 }} />
                <input 
                  type="text" 
                  placeholder="Pesquisar por nome ou telefone..." 
                  className="pl-12 mb-0"
                  style={{ paddingLeft: '3rem', marginBottom: 0 }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
                <Filter size={18} />
              </button>
            </div>
          </div>

          <div className="card">
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
                      <td colSpan={4} className="text-center py-20 opacity-30 text-muted">
                        Nenhum contato encontrado.
                      </td>
                    </tr>
                  ) : (
                    filteredContacts.map((contact) => (
                      <tr key={contact.id}>
                        <td>
                          <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.75rem' }}>
                              {contact.name.charAt(0)}
                            </div>
                            <span className="font-semibold">{contact.name}</span>
                          </div>
                        </td>
                        <td className="font-mono text-muted">{contact.phone}</td>
                        <td>
                          <span className="text-[10px] font-bold px-2 py-1 rounded bg-success/10 text-success border border-success/20 uppercase tracking-tighter">
                            {contact.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button className="text-muted hover:text-error" onClick={() => deleteContact(contact.id)}>
                            <Trash2 size={16} />
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
