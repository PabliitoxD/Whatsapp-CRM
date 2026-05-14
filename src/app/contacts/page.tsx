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
      <div className="page-header">
        <div>
          <h1>Audiência <span className="text-primary">Master</span></h1>
          <p className="text-muted text-lg font-medium mt-2">Gestão centralizada de leads e variáveis inteligentes.</p>
        </div>
        <div className="flex gap-4">
          <button className="btn-primary" style={{ background: 'rgba(239, 68, 68, 0.05)', color: 'var(--error)', border: '1px solid rgba(239, 68, 68, 0.1)' }} onClick={clearContacts}>
            <Trash2 size={18} /> Limpar Base
          </button>
          <label className="btn-primary cursor-pointer mb-0">
            <Upload size={18} /> Importar Leads
            <input type="file" hidden accept=".csv,.txt" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header-unified">
            <div className="card-title-group">
              <div className="card-icon-box"><Tag size={20} /></div>
              <h3>Tags Dinâmicas</h3>
            </div>
          </div>
          <div className="card-inner">
            <div className="input-group">
              <label>Nova Tag Estratégica</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="ex: empresa" 
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <button className="btn-primary" style={{ padding: '0 1.25rem' }} onClick={handleAddTag}>
                  <Plus size={24} />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {customTags.map((tag) => (
                <div key={tag} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 group">
                  <span className="font-bold tracking-tight text-primary">{'{'}{'{'}{tag}{'}'}{'}'}</span>
                  {tag !== 'nome' && tag !== 'telefone' ? (
                    <button onClick={() => deleteCustomTag(tag)} className="text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all">
                      <X size={16} />
                    </button>
                  ) : (
                    <CheckCircle2 size={16} className="text-success opacity-50" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header-unified">
            <div className="card-title-group">
              <div className="card-icon-box"><Users size={20} /></div>
              <h3>Lista de Leads</h3>
            </div>
            <div className="flex gap-4">
              <div style={{ position: 'relative', width: '250px' }}>
                <Search size={16} style={{ position: 'absolute', left: '1.25rem', top: '1.15rem', opacity: 0.3 }} />
                <input 
                  type="text" 
                  placeholder="Pesquisar..." 
                  className="pl-12 py-2.5 text-sm"
                  style={{ paddingLeft: '3.25rem', paddingBottom: '0.75rem', paddingTop: '0.75rem' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          
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
                    <td colSpan={4}>
                      <div className="empty-state">
                        <Database size={40} className="empty-state-icon" />
                        <p>Nenhum lead encontrado</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-white/[0.01] transition-colors">
                      <td>
                        <div className="flex items-center gap-4">
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900' }}>
                            {contact.name.charAt(0)}
                          </div>
                          <span className="font-bold">{contact.name}</span>
                        </div>
                      </td>
                      <td className="font-mono text-muted text-sm">{contact.phone}</td>
                      <td>
                        <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-success/10 text-success border border-success/20 uppercase tracking-widest">
                          {contact.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="p-2 text-muted hover:text-error transition-all" onClick={() => deleteContact(contact.id)}>
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
  );
};

export default Contacts;
