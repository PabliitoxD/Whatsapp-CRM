'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  status: 'Ativo' | 'Inativo';
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  templateId: string;
  status: 'Pendente' | 'Rodando' | 'Finalizada' | 'Pausada';
  total: number;
  success: number;
  error: number;
  createdAt: string;
}

interface ContactContextType {
  contacts: Contact[];
  templates: MessageTemplate[];
  campaigns: Campaign[];
  addContacts: (newContacts: Omit<Contact, 'id' | 'createdAt'>[]) => void;
  deleteContact: (id: string) => void;
  clearContacts: () => void;
  addTemplate: (template: Omit<MessageTemplate, 'id' | 'createdAt'>) => void;
  deleteTemplate: (id: string) => void;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'status' | 'success' | 'error'>) => string;
  updateCampaignStats: (id: string, stats: Partial<Pick<Campaign, 'success' | 'error' | 'status'>>) => void;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedContacts = localStorage.getItem('whatsapp-crm-contacts');
    const savedTemplates = localStorage.getItem('whatsapp-crm-templates');
    const savedCampaigns = localStorage.getItem('whatsapp-crm-campaigns');
    
    if (savedContacts) setContacts(JSON.parse(savedContacts));
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
    if (savedCampaigns) setCampaigns(JSON.parse(savedCampaigns));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('whatsapp-crm-contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('whatsapp-crm-templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('whatsapp-crm-campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  const addContacts = (newContacts: Omit<Contact, 'id' | 'createdAt'>[]) => {
    const contactsWithIds = newContacts.map(c => ({
      ...c,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }));
    setContacts(prev => [...prev, ...contactsWithIds]);
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const clearContacts = () => {
    setContacts([]);
  };

  const addTemplate = (template: Omit<MessageTemplate, 'id' | 'createdAt'>) => {
    const newTemplate = {
      ...template,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const addCampaign = (campaign: Omit<Campaign, 'id' | 'createdAt' | 'status' | 'success' | 'error'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newCampaign: Campaign = {
      ...campaign,
      id,
      status: 'Pendente',
      success: 0,
      error: 0,
      createdAt: new Date().toISOString(),
    };
    setCampaigns(prev => [newCampaign, ...prev]);
    return id;
  };

  const updateCampaignStats = (id: string, stats: Partial<Pick<Campaign, 'success' | 'error' | 'status'>>) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, ...stats } : c));
  };

  return (
    <ContactContext.Provider value={{ 
      contacts, 
      templates, 
      campaigns,
      addContacts, 
      deleteContact, 
      clearContacts,
      addTemplate,
      deleteTemplate,
      addCampaign,
      updateCampaignStats
    }}>
      {children}
    </ContactContext.Provider>
  );
};

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (context === undefined) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
};
