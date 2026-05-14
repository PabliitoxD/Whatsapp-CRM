import React from 'react';

/**
 * COMPONENTES DE UI PADRONIZADOS - WHATSAPP CRM MASTER
 * 
 * Este arquivo contém a base visual do sistema. 
 * Todos os componentes aqui foram desenhados para garantir alinhamento perfeito 
 * e consistência entre todos os menus.
 */

// 1. HEADER DA PÁGINA (Título principal e botões de ação do topo)
export const PageHeader = ({ title, subtitle, children }: { title: string, subtitle: string, children?: React.ReactNode }) => (
  <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '4rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--border)' }}>
    <div style={{ flex: 1 }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.04em', margin: 0, lineHeight: 1 }}>{title}</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '1rem', fontWeight: 500 }}>{subtitle}</p>
    </div>
    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
      {children}
    </div>
  </div>
);

// 2. CARD UNIFICADO (Container com cabeçalho e ícone perfeitamente alinhado)
export const UICard = ({ title, icon: Icon, children, headerAction }: { title: string, icon: any, children: React.ReactNode, headerAction?: React.ReactNode }) => (
  <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    {/* Cabeçalho do Card: Ícone e Título alinhados horizontalmente */}
    <div className="card-header-unified" style={{ padding: '2rem 2.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ width: '48px', height: '48px', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
          <Icon size={22} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{title}</h3>
      </div>
      {headerAction && <div>{headerAction}</div>}
    </div>
    
    {/* Conteúdo do Card: Padding generoso e flexível */}
    <div style={{ padding: '3rem', flex: 1 }}>
      {children}
    </div>
  </div>
);

// 3. STAT CARD (Cards pequenos de estatísticas no topo)
export const StatCard = ({ label, value, icon: Icon, color = 'var(--primary)' }: { label: string, value: string | number, icon: any, color?: string }) => (
  <div className="card" style={{ padding: '2.5rem' }}>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem' }}>{label}</p>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{value}</span>
      <div style={{ width: '52px', height: '52px', backgroundColor: `${color}10`, color: color, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${color}20` }}>
        <Icon size={24} />
      </div>
    </div>
  </div>
);

// 4. BOTÃO PADRONIZADO
export const UIButton = ({ children, onClick, variant = 'primary', style = {} }: any) => {
  const isDanger = variant === 'danger';
  return (
    <button 
      onClick={onClick}
      className="btn-primary"
      style={{ 
        backgroundColor: isDanger ? 'rgba(239, 68, 68, 0.05)' : 'var(--primary)',
        color: isDanger ? 'var(--error)' : 'white',
        border: isDanger ? '1px solid rgba(239, 68, 68, 0.1)' : 'none',
        ...style 
      }}
    >
      {children}
    </button>
  );
};
