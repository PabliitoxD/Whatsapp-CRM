'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Upload, 
  Trash2, 
  Search,
  Filter,
  Download
} from 'lucide-react';
import { useContacts } from '../../lib/ContactContext';

const Contacts = () => {
  const { contacts, addContacts, deleteContact, clearContacts } = useContacts();
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="contacts-page">
      <div className="card-header mb-8" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-3xl font-extrabold">Gestão de <span style={{ color: 'var(--primary)' }}>Contatos</span></h1>
          <p className="text-muted">Total de {contacts.length} leads qualificados.</p>
        </div>
        <div className="flex gap-3" style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn-primary" style={{ background: 'var(--error)' }} onClick={clearContacts}>
            <Trash2 size={18} /> Limpar Tudo
          </button>
          <label className="btn-primary cursor-pointer">
            <Upload size={18} /> Importar CSV
            <input type="file" hidden accept=".csv,.txt" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      <div className="card mb-6">
        <div className="flex items-center gap-4" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="flex-1" style={{ flex: 1 }}>
            <div style={{ position: 'relative' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '0.8rem', opacity: 0.3 }} />
              <input 
                type="text" 
                placeholder="Pesquisar por nome ou telefone..." 
                className="pl-12"
                style={{ paddingLeft: '3rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
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
                    Nenhum contato encontrado na sua base.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <tr key={contact.id}>
                    <td>
                      <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs" style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.2)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {contact.name.charAt(0)}
                        </div>
                        <span className="font-semibold">{contact.name}</span>
                      </div>
                    </td>
                    <td className="font-mono text-muted">{contact.phone}</td>
                    <td>
                      <span className="text-[10px] font-bold px-2 py-1 rounded bg-success/10 text-success border border-success/20">
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
  );
};

export default Contacts;
