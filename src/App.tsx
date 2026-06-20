import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Occurrences from './pages/Occurrences'
import PlaceholderPage from './pages/PlaceholderPage'
import Stores from './pages/Stores'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ocorrencias" element={<Occurrences />} />
      <Route path="/lojas" element={<Stores />} />
      <Route path="/colaboradores" element={<PlaceholderPage title="Colaboradores" description="Gestão dos colaboradores vinculados às lojas." />} />
      <Route path="/responsaveis" element={<PlaceholderPage title="Responsáveis" description="Gestão dos responsáveis pelo atendimento das ocorrências." />} />
      <Route path="/relatorios" element={<PlaceholderPage title="Relatórios" description="Indicadores e relatórios gerenciais das ocorrências." />} />
      <Route path="/configuracoes" element={<PlaceholderPage title="Configurações" description="Configurações gerais e tipos de ocorrência." />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
