'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Upload, 
  Trash2, 
  Search,
  MoreVertical,
  Mail,
  UserPlus,
  Filter,
  Download
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
    <div className="contacts-page animate-fade-in">
      <header className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            Audiência <span className="gradient-text">Master</span>
          </motion.h1>
          <p>Gerencie sua base de {contacts.length} leads qualificados.</p>
        </div>
        <div className="header-actions flex gap-3">
          <button className="btn-secondary flex items-center gap-2" onClick={clearContacts}>
            <Trash2 size={18} />
            <span className="hidden sm:inline">Limpar Base</span>
          </button>
          <label className="btn-primary gradient-bg cursor-pointer flex items-center gap-2">
            <Upload size={18} />
            <span>Importar Leads</span>
            <input type="file" hidden accept=".csv,.txt" onChange={handleFileUpload} />
          </label>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="search-bar glass flex-1 flex items-center px-6 py-4 gap-4">
          <Search size={20} className="text-white/20" />
          <input 
            type="text" 
            placeholder="Pesquisar por nome, telefone ou tag..." 
            value={searchTerm}
            className="w-full bg-transparent border-none p-0 outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn-secondary p-4 flex items-center justify-center">
          <Filter size={20} />
        </button>
      </div>

      <div className="contacts-table-container glass">
        <table className="contacts-table w-full">
          <thead>
            <tr>
              <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-widest opacity-40">Lead</th>
              <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-widest opacity-40">Telefone</th>
              <th className="px-6 py-5 text-left text-[11px] font-bold uppercase tracking-widest opacity-40">Status</th>
              <th className="px-6 py-5 text-right text-[11px] font-bold uppercase tracking-widest opacity-40">Ações</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-20">
                    <div className="flex flex-col items-center opacity-20">
                      <Users size={64} className="mb-4" />
                      <p className="font-semibold">Nenhum contato na sua base no momento.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((contact, i) => (
                  <motion.tr 
                    key={contact.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="user-info flex items-center gap-4">
                        <div className="user-avatar w-10 h-10 rounded-xl bg-accent-gradient flex items-center justify-center font-bold text-sm shadow-lg shadow-purple-500/20">
                          {contact.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-sm">{contact.name}</span>
                          <span className="text-[10px] opacity-40 font-mono">ID_{contact.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium opacity-70">{contact.phone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`status-pill px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${contact.status.toLowerCase()}`}>
                        {contact.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white" title="Excluir" onClick={() => deleteContact(contact.id)}>
                          <Trash2 size={16} />
                        </button>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-white/40 hover:text-white">
                          <MoreVertical size={16} />
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

      <style jsx>{`
        .status-pill.ativo { background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .status-pill.inativo { background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2); }
      `}</style>
    </div>
  );
};

export default Contacts;
