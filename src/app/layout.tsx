import type { Metadata } from 'next';
import '../styles/globals.css';
import Sidebar from '../components/Sidebar';
import { ContactProvider } from '../lib/ContactContext';

export const metadata: Metadata = {
  title: 'WhatsApp CRM Master',
  description: 'Gestão de contatos e envios em massa via WhatsApp',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <ContactProvider>
          <div className="app-container">
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
          </div>
        </ContactProvider>
      </body>
    </html>
  );
}
