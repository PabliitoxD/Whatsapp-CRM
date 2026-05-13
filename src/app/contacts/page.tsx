'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Upload, 
  Trash2, 
  Search,
  MoreVertical,
  Mail,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
          const [name, phone] = line.split(',').map(s => s.trim());
          if (name && phone) {
            // Clean phone number (remove non-digits)
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
    <div className="contacts-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Gestão de <span className="gradient-text">Contatos</span></h1>
          <p>Total de {contacts.length} contatos na sua base.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={clearContacts}>
            <Trash2 size={18} />
            Limpar Base
          </button>
          <label className="btn-primary gradient-bg cursor-pointer">
            <Upload size={18} />
            Importar CSV
            <input type="file" hidden accept=".csv,.txt" onChange={handleFileUpload} />
          </label>
        </div>
      </header>

      <div className="search-bar glass">
        <Search size={20} className="text-muted" />
        <input 
          type="text" 
          placeholder="Buscar contatos por nome ou telefone..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="contacts-table-container glass">
        <table className="contacts-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-muted">
                    Nenhum contato encontrado.
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact) => (
                  <motion.tr 
                    key={contact.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">{contact.name.charAt(0)}</div>
                        <span>{contact.name}</span>
                      </div>
                    </td>
                    <td>{contact.phone}</td>
                    <td>
                      <span className={`status-pill ${contact.status.toLowerCase()}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button title="Excluir" onClick={() => deleteContact(contact.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Contacts;
