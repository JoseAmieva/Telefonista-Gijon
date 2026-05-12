import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { AuthDraftProvider, useAuthDraft } from "./context/AuthDraftContext";
import LoginPage from "./pages/LoginPage";
import MenuPage from "./pages/MenuPage";
import TelefonistaHome from "./pages/TelefonistaHome";
import EspectadorPage from "./pages/EspectadorPage";
import HistorialPage from "./pages/HistorialPage";
import HistorialDetallePage from "./pages/HistorialDetallePage";
import IncendioEstructuralPage from "./pages/incidents/IncendioEstructuralPage";
import GenericIncidentPage from "./pages/incidents/GenericIncidentPage";

function Protected() {
  const { authenticated, loading } = useAuthDraft();
  const loc = useLocation();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-600">
        Cargando…
      </div>
    );
  }
  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  }
  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<Protected />}>
        <Route path="/" element={<Navigate to="/menu" replace />} />
        <Route path="/menu" element={<MenuPage />} />
        <Route path="/t" element={<TelefonistaHome />} />
        <Route path="/t/incendio-estructural" element={<IncendioEstructuralPage />} />
        <Route path="/t/incendio-forestal" element={<GenericIncidentPage incidentKey="incendio_forestal" />} />
        <Route path="/t/incendio-vehiculo" element={<GenericIncidentPage incidentKey="incendio_vehiculo" />} />
        <Route path="/t/accidente-trafico" element={<GenericIncidentPage incidentKey="accidente_trafico" />} />
        <Route path="/t/rescate" element={<GenericIncidentPage incidentKey="rescate" />} />
        <Route path="/t/acceso-vivienda" element={<GenericIncidentPage incidentKey="acceso_vivienda" />} />
        <Route path="/t/fachadas" element={<GenericIncidentPage incidentKey="fachadas" />} />
        <Route path="/t/helicopteros" element={<GenericIncidentPage incidentKey="helicopteros" />} />
        <Route path="/t/otros" element={<GenericIncidentPage incidentKey="otros" />} />
        <Route path="/esp" element={<EspectadorPage />} />
        <Route path="/historial" element={<HistorialPage />} />
        <Route path="/historial/:id" element={<HistorialDetallePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/menu" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthDraftProvider>
      <AppRoutes />
    </AuthDraftProvider>
  );
}
