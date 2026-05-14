'use client';

import React, { useState } from 'react';
import { Users, Upload, Trash2, Search, Plus, Tag, X, CheckCircle2, Database } from 'lucide-react';
import { useContacts } from '../../lib/ContactContext';
import { PageHeader, UICard, UIButton } from '../../components/UIComponents';

/**
 * PÁGINA: AUDIÊNCIA (CONTATOS E TAGS)
 * 
 * Gerencia a base de leads e as variáveis dinâmicas de personalização.
 * Organizada em duas colunas: Gestão de Tags (Esquerda) e Lista de Leads (Direita).
 */

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

  // Função para processar upload de arquivo CSV/TXT simples
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
      {/* Cabeçalho com ações globais de importação e limpeza */}
      <PageHeader 
        title="Audiência Master" 
        subtitle="Gestão estratégica de leads e variáveis de personalização em massa."
      >
        <UIButton variant="danger" onClick={clearContacts}>
          <Trash2 size={18} /> Limpar Base
        </UIButton>
        <label className="btn-primary cursor-pointer mb-0">
          <Upload size={18} /> Importar Leads
          <input type="file" hidden accept=".csv,.txt" onChange={handleFileUpload} />
        </label>
      </PageHeader>

      <div className="grid-2">
        {/* COLUNA ESQUERDA: TAGS DINÂMICAS */}
        <UICard title="Tags Dinâmicas" icon={Tag}>
          <div className="input-group">
            <label>Criar Nova Tag Estratégica</label>
            <div className="flex gap-2">
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '1.25rem', top: '1.25rem', color: 'var(--primary)', fontWeight: 900 }}>{'{'}{'{'}</span>
                <input 
                  type="text" 
                  placeholder="ex: empresa" 
                  style={{ paddingLeft: '3.5rem' }}
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
              </div>
              <UIButton onClick={handleAddTag} style={{ padding: '0 1.25rem' }}>
                <Plus size={24} />
              </UIButton>
            </div>
          </div>

          <div className="space-y-3 mt-8">
            <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-4">Variáveis Ativas no Sistema</p>
            {customTags.map((tag) => (
              <div key={tag} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5 group transition-all hover:border-primary/30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-xs font-black">
                    {'{'}{'{'}
                  </div>
                  <span className="font-bold tracking-tight">{tag}</span>
                </div>
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
        </UICard>

        {/* COLUNA DIREITA: LISTA DE LEADS (Com busca integrada no cabeçalho) */}
        <UICard 
          title="Lista de Leads" 
          icon={Users}
          headerAction={
            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '1.2rem', opacity: 0.3 }} />
              <input 
                type="text" 
                placeholder="Pesquisar por nome ou número..." 
                style={{ paddingLeft: '3.75rem', fontSize: '0.9rem', paddingBottom: '1rem', paddingTop: '1rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          }
        >
          <div className="table-container" style={{ margin: '-3rem' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ paddingLeft: '3rem' }}>Lead</th>
                  <th>Telefone</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '3rem' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state py-24">
                        <Database size={56} className="empty-state-icon" />
                        <p className="font-black opacity-40">Nenhum lead encontrado na sua base.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-white/[0.01] transition-colors">
                      <td style={{ paddingLeft: '3rem' }}>
                        <div className="flex items-center gap-4">
                          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.9rem' }}>
                            {contact.name.charAt(0)}
                          </div>
                          <span className="font-bold text-lg tracking-tight">{contact.name}</span>
                        </div>
                      </td>
                      <td className="font-mono text-muted text-base">{contact.phone}</td>
                      <td>
                        <div className="flex items-center gap-2 text-success font-black text-[10px] uppercase tracking-widest">
                          <div className="w-2 h-2 bg-success rounded-full" />
                          {contact.status}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '3rem' }}>
                        <button className="p-3 text-muted hover:text-error transition-all hover:bg-error/10 rounded-xl" onClick={() => deleteContact(contact.id)}>
                          <Trash2 size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </UICard>
      </div>
    </div>
  );
};

export default Contacts;
