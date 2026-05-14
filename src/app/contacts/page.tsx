'use client';

import React, { useState } from 'react';
import { Users, Upload, Trash2, Search, Plus, Tag, X, CheckCircle2, Database } from 'lucide-react';
import { useContacts } from '../../lib/ContactContext';
import { PageHeader, UICard, UIButton } from '../../components/UIComponents';

/**
 * PÁGINA: AUDIÊNCIA (CONTATOS E TAGS) - REVISÃO DE ALINHAMENTO
 * 
 * Corrigido: Alinhamento horizontal forçado para inputs e tags.
 * Garantia de que elementos não quebrem linha em telas menores.
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

      {/* Grid reajustada para dar mais espaço à coluna de tags se necessário */}
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '3.5rem' }}>
        
        {/* COLUNA ESQUERDA: TAGS DINÂMICAS */}
        <UICard title="Tags Dinâmicas" icon={Tag}>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '1.5rem' }}>Criar Nova Tag Estratégica</label>
            
            {/* INPUT + BOTÃO: Forçado em linha com Flexbox Direto */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)', fontWeight: 900, zIndex: 10 }}>{'{'}{'{'}</span>
                <input 
                  type="text" 
                  placeholder="ex: empresa" 
                  style={{ paddingLeft: '3.5rem', marginBottom: 0, width: '100%' }}
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                />
              </div>
              <UIButton onClick={handleAddTag} style={{ height: '56px', width: '56px', padding: 0, flexShrink: 0, borderRadius: '16px' }}>
                <Plus size={24} />
              </UIButton>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-[10px] font-black uppercase text-muted tracking-widest mb-6 opacity-50">Variáveis Ativas no Sistema</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {customTags.map((tag) => (
                /* TAG ITEM: Forçado em linha horizontal única */
                <div key={tag} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>
                      {'{'}{'{'}
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1rem', whiteSpace: 'nowrap' }}>{tag}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {tag !== 'nome' && tag !== 'telefone' ? (
                      <button onClick={() => deleteCustomTag(tag)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.5rem' }}>
                        <X size={16} />
                      </button>
                    ) : (
                      <CheckCircle2 size={18} className="text-success" style={{ opacity: 0.6 }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </UICard>

        {/* COLUNA DIREITA: LISTA DE LEADS */}
        <UICard 
          title="Lista de Leads" 
          icon={Users}
          headerAction={
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={18} style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                style={{ paddingLeft: '3.75rem', fontSize: '0.9rem', height: '50px', marginBottom: 0 }}
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
                        <p className="font-black opacity-30">Nenhum lead encontrado.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} style={{ transition: 'background-color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                      <td style={{ paddingLeft: '3rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.9rem' }}>
                            {contact.name.charAt(0)}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{contact.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '1rem' }}>{contact.phone}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                          <div style={{ width: '8px', height: '8px', backgroundColor: 'var(--success)', borderRadius: '50%' }} />
                          {contact.status}
                        </div>
                      </td>
                      <td style={{ textAlign: 'right', paddingRight: '3rem' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.75rem', color: 'var(--text-muted)', transition: 'color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--error)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'} onClick={() => deleteContact(contact.id)}>
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
