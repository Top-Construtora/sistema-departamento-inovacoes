import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts';
import { Layout, DefinirSenhaModal } from './components';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Projetos } from './pages/Projetos';
import { ProjetoDetalhes } from './pages/ProjetoDetalhes';
import { Demandas } from './pages/Demandas';
import { Chamados } from './pages/Chamados';
import { ChamadoDetalhes } from './pages/ChamadoDetalhes';
import { SistemasAcesso } from './pages/SistemasAcesso';
import { SistemaDetalhes } from './pages/SistemaDetalhes';
import { IdentidadeVisual } from './pages/IdentidadeVisual';
import { Usuarios } from './pages/Usuarios';
import { Portfolio } from './pages/Portfolio';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <DefinirSenhaModal />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projetos" element={<Projetos />} />
            <Route path="projetos/:id" element={<ProjetoDetalhes />} />
            <Route path="demandas" element={<Demandas />} />
            <Route path="chamados" element={<Chamados />} />
            <Route path="chamados/:id" element={<ChamadoDetalhes />} />
            <Route path="sistemas-acesso" element={<SistemasAcesso />} />
            <Route path="sistemas-acesso/:id" element={<SistemaDetalhes />} />
            <Route path="identidade-visual" element={<IdentidadeVisual />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="portfolio" element={<Portfolio />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
