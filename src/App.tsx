import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Occurrences from './pages/Occurrences'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Responsibles from './pages/Responsibles'
import Stores from './pages/Stores'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ocorrencias" element={<Occurrences />} />
      <Route path="/lojas" element={<Stores />} />
      <Route path="/colaboradores" element={<Employees />} />
      <Route path="/responsaveis" element={<Responsibles />} />
      <Route path="/relatorios" element={<Reports />} />
      <Route path="/configuracoes" element={<Settings />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
