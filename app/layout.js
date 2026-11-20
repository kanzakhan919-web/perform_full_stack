import './globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ConnectionStatus from '@/components/ConnectionStatus';

export const metadata = {
  title: 'Perform360 | Engro',
  description: 'Employee performance and appraisal platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ConnectionStatus />
        <div className="layout">
          <Sidebar />
          <main className="main">
            <Header />
            {children}
            <div className="footer">
              PERFORM360 Academic Project · Sample data is illustrative and is not official Engro Corporation
              information.
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
