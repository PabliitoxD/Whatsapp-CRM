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

export interface WhatsAppInstance {
  id: string;
  name: string;
  status: 'disconnected' | 'connecting' | 'connected';
  qrCode?: string;
  createdAt: string;
}

interface ContactContextType {
  contacts: Contact[];
  templates: MessageTemplate[];
  campaigns: Campaign[];
  instances: WhatsAppInstance[];
  customTags: string[];
  addContacts: (newContacts: Omit<Contact, 'id' | 'createdAt'>[]) => void;
  deleteContact: (id: string) => void;
  clearContacts: () => void;
  addTemplate: (template: Omit<MessageTemplate, 'id' | 'createdAt'>) => void;
  deleteTemplate: (id: string) => void;
  addCampaign: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'status' | 'success' | 'error'>) => string;
  updateCampaignStats: (id: string, stats: Partial<Pick<Campaign, 'success' | 'error' | 'status'>>) => void;
  addInstance: (name: string) => string;
  deleteInstance: (id: string) => void;
  updateInstance: (id: string, updates: Partial<WhatsAppInstance>) => void;
  addCustomTag: (tag: string) => void;
  deleteCustomTag: (tag: string) => void;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [customTags, setCustomTags] = useState<string[]>(['nome', 'telefone']);

  // Load from localStorage on mount
  useEffect(() => {
    const savedContacts = localStorage.getItem('whatsapp-crm-contacts');
    const savedTemplates = localStorage.getItem('whatsapp-crm-templates');
    const savedCampaigns = localStorage.getItem('whatsapp-crm-campaigns');
    const savedInstances = localStorage.getItem('whatsapp-crm-instances');
    const savedTags = localStorage.getItem('whatsapp-crm-tags');
    
    if (savedContacts) setContacts(JSON.parse(savedContacts));
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
    if (savedCampaigns) setCampaigns(JSON.parse(savedCampaigns));
    if (savedInstances) setInstances(JSON.parse(savedInstances));
    if (savedTags) setCustomTags(JSON.parse(savedTags));
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

  useEffect(() => {
    localStorage.setItem('whatsapp-crm-instances', JSON.stringify(instances));
  }, [instances]);

  useEffect(() => {
    localStorage.setItem('whatsapp-crm-tags', JSON.stringify(customTags));
  }, [customTags]);

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

  const addInstance = (name: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newInstance: WhatsAppInstance = {
      id,
      name,
      status: 'disconnected',
      createdAt: new Date().toISOString(),
    };
    setInstances(prev => [...prev, newInstance]);
    return id;
  };

  const deleteInstance = (id: string) => {
    setInstances(prev => prev.filter(i => i.id !== id));
  };

  const updateInstance = (id: string, updates: Partial<WhatsAppInstance>) => {
    setInstances(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const addCustomTag = (tag: string) => {
    const cleanTag = tag.replace(/[{}]/g, '').toLowerCase();
    if (!customTags.includes(cleanTag)) {
      setCustomTags(prev => [...prev, cleanTag]);
    }
  };

  const deleteCustomTag = (tag: string) => {
    if (tag === 'nome' || tag === 'telefone') return;
    setCustomTags(prev => prev.filter(t => t !== tag));
  };

  return (
    <ContactContext.Provider value={{ 
      contacts, 
      templates, 
      campaigns,
      instances,
      customTags,
      addContacts, 
      deleteContact, 
      clearContacts,
      addTemplate,
      deleteTemplate,
      addCampaign,
      updateCampaignStats,
      addInstance,
      deleteInstance,
      updateInstance,
      addCustomTag,
      deleteCustomTag
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
