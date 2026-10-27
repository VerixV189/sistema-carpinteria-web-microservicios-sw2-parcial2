import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useRef, useState, type ReactElement } from 'react';
import { mountRootParcel } from 'single-spa';
import Navbar from './components/Navbar';
import AgentChat from './components/AgentChat';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import CatalogPage from './pages/CatalogPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import QuotationPage from './pages/QuotationPage';
import MyQuotationsPage from './pages/MyQuotationsPage';
import PaymentPage from './pages/PaymentPage';
import ReceiptsPage from './pages/ReceiptsPage';
import { getSession, homeFor, type Session } from './auth';
import { loadAdminApp, loadWorkshopApp } from './mfe';

/** Guard: exige sesión y opcionalmente uno de los roles dados. */
function RequireRole({ roles, children }: { roles?: Session['role'][]; children: ReactElement }) {
  const session = getSession();
  if (!session) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(session.role)) return <Navigate to={homeFor(session.role)} replace />;
  return children;
}

/** Slot MFE: monta el remote cuando el div ya existe (sin race), desmonta al salir. */
function Slot({ name, loader }: { name: string; loader: () => Promise<unknown> }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const parcel = mountRootParcel(loader as never, {
      name,
      domElement: ref.current,
    });
    return () => {
      parcel.unmount().catch(() => undefined);
    };
  }, [name, loader]);
  return <div ref={ref} style={{ minHeight: 'calc(100vh - 64px)' }} />;
}

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <BrowserRouter>
      <Navbar />
      <div className={'content-zone' + (chatOpen ? ' con-chat' : '')}>
      <Routes>
        {/* Vitrina pública — sin login */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/productos" element={<CatalogPage />} />
        <Route path="/nosotros" element={<AboutPage />} />
        <Route path="/contacto" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        {/* Zona cliente (autenticada) */}
        <Route path="/cotizar" element={<RequireRole roles={['CLIENT', 'ADMIN']}><QuotationPage /></RequireRole>} />
        <Route path="/mis-cotizaciones" element={<RequireRole roles={['CLIENT', 'ADMIN']}><MyQuotationsPage /></RequireRole>} />
        <Route path="/pagar/:quotationId" element={<RequireRole roles={['CLIENT', 'ADMIN']}><PaymentPage /></RequireRole>} />
        <Route path="/recibos" element={<RequireRole roles={['CLIENT', 'ADMIN']}><ReceiptsPage /></RequireRole>} />
        {/* Microfrontends montados por single-spa (mismo origen → sesión compartida) */}
        <Route path="/admin" element={<Navigate to="/admin/clientes" replace />} />
        <Route path="/admin/*" element={<RequireRole roles={['ADMIN']}><Slot name="admin-app" loader={loadAdminApp} /></RequireRole>} />
        <Route path="/taller/*" element={<RequireRole roles={['CARPENTER', 'ADMIN']}><Slot name="workshop-app" loader={loadWorkshopApp} /></RequireRole>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
      <AgentChat open={chatOpen} onToggle={setChatOpen} />
    </BrowserRouter>
  );
}
