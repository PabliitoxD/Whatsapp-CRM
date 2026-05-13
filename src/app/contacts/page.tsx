'use client';

import React, { useState, useRef } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  FileUp, 
  Trash2,
  Mail,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useContacts } from '../../lib/ContactContext';

const Contacts = () => {
  const { contacts, addContacts, deleteContact, clearContacts } = useContacts();
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newContacts: any[] = [];

      lines.forEach((line, index) => {
        if (index === 0 && (line.toLowerCase().includes('nome') || line.toLowerCase().includes('phone'))) return; // Skip header
        
        const [name, phone] = line.split(',').map(s => s.trim());
        if (name && phone) {
          newContacts.push({
            name,
            phone: phone.replace(/\D/g, ''), // Remove non-numeric
            status: 'Ativo'
          });
        }
      });

      if (newContacts.length > 0) {
        addContacts(newContacts);
        alert(`${newContacts.length} contatos importados com sucesso!`);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const downloadExample = () => {
    const content = "nome,telefone\nJoao Silva,5511999999999\nMaria Souza,5511888888888";
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exemplo_contatos.csv';
    a.click();
  };

  return (
    <div className="contacts-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Gestão de <span className="gradient-text">Contatos</span></h1>
          <p>Importe e organize seus clientes para envios em massa.</p>
        </div>
        <div className="header-actions">
          <input 
            type="file" 
            accept=".csv,.txt" 
            style={{ display: 'none' }} 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button className="btn-secondary" onClick={downloadExample}>
            <Download size={18} />
            Exemplo
          </button>
          <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>
            <FileUp size={18} />
            Importar CSV
          </button>
          <button className="btn-primary gradient-bg">
            <UserPlus size={18} />
            Novo Contato
          </button>
        </div>
      </header>

      <div className="search-bar glass">
        <Search size={20} color="rgba(255,255,255,0.4)" />
        <input 
          type="text" 
          placeholder="Pesquisar por nome ou telefone (apenas números)..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {contacts.length > 0 && (
          <button onClick={clearContacts} className="btn-clear" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>
            Limpar Lista
          </button>
        )}
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
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.2)' }}>
                  Nenhum contato encontrado. Importe um arquivo CSV para começar.
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact, index) => (
                <motion.tr 
                  key={contact.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 1) }}
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
                      <button title="Enviar Mensagem"><Mail size={16} /></button>
                      <button title="Excluir" onClick={() => deleteContact(contact.id)}><Trash2 size={16} /></button>
                      <button><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .contacts-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-primary, .btn-secondary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .btn-primary {
          color: white;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }

        .btn-secondary {
          background: var(--glass-border);
          color: white;
        }

        .search-bar {
          display: flex;
          align-items: center;
          padding: 0.75rem 1.5rem;
          margin-bottom: 2rem;
          gap: 1rem;
        }

        .search-bar input {
          background: none;
          border: none;
          color: white;
          width: 100%;
          outline: none;
          font-size: 1rem;
        }

        .contacts-table-container {
          overflow: hidden;
        }

        .contacts-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .contacts-table th {
          padding: 1.25rem 1.5rem;
          background: rgba(255, 255, 255, 0.02);
          color: rgba(255, 255, 255, 0.5);
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .contacts-table td {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--glass-border);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.75rem;
        }

        .status-pill {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-pill.ativo { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .status-pill.inativo { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .table-actions {
          display: flex;
          gap: 0.5rem;
        }

        .table-actions button {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.4);
          transition: var(--transition);
        }

        .table-actions button:hover {
          background: var(--glass-hover);
          color: white;
        }
      `}</style>
    </div>
  );
};

export default Contacts;
