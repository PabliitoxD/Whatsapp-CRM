'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Contact {
  id: string;
  name: string;
  phone: string;
  status: 'Ativo' | 'Inativo';
  createdAt: string;
}

interface ContactContextType {
  contacts: Contact[];
  addContacts: (newContacts: Omit<Contact, 'id' | 'createdAt'>[]) => void;
  deleteContact: (id: string) => void;
  clearContacts: () => void;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const ContactProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('whatsapp-crm-contacts');
    if (saved) {
      try {
        setContacts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load contacts', e);
      }
    }
  }, []);

  // Save to localStorage when contacts change
  useEffect(() => {
    localStorage.setItem('whatsapp-crm-contacts', JSON.stringify(contacts));
  }, [contacts]);

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

  return (
    <ContactContext.Provider value={{ contacts, addContacts, deleteContact, clearContacts }}>
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
