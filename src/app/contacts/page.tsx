'use client';

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreVertical, 
  FileUp, 
  Trash2,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';

const Contacts = () => {
  const [contacts, setContacts] = useState([
    { id: 1, name: 'João Silva', phone: '5511999999999', status: 'Ativo' },
    { id: 2, name: 'Maria Souza', phone: '5511888888888', status: 'Ativo' },
    { id: 3, name: 'Pedro Santos', phone: '5511777777777', status: 'Inativo' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <div className="contacts-page animate-fade-in">
      <header className="page-header">
        <div>
          <h1>Gestão de <span className="gradient-text">Contatos</span></h1>
          <p>Importe e organize seus clientes para envios em massa.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
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
          placeholder="Pesquisar por nome ou telefone..." 
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
            {filteredContacts.map((contact, index) => (
              <motion.tr 
                key={contact.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
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
                    <button title="Excluir"><Trash2 size={16} /></button>
                    <button><MoreVertical size={16} /></button>
                  </div>
                </td>
              </motion.tr>
            ))}
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
