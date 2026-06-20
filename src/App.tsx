import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import ForgotPassword from './pages/ForgotPassword'
import Login from './pages/Login'
import Occurrences from './pages/Occurrences'
import Reports from './pages/Reports'
import ResetPassword from './pages/ResetPassword'
import Responsibles from './pages/Responsibles'
import Settings from './pages/Settings'
import Stores from './pages/Stores'
import './App.css'

function privatePage(page: ReactNode) {
  return <ProtectedRoute>{page}</ProtectedRoute>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/recuperar-senha" element={<ForgotPassword />} />
      <Route path="/nova-senha" element={<ResetPassword />} />
      <Route path="/dashboard" element={privatePage(<Dashboard />)} />
      <Route path="/ocorrencias" element={privatePage(<Occurrences />)} />
      <Route path="/lojas" element={privatePage(<Stores />)} />
      <Route path="/colaboradores" element={privatePage(<Employees />)} />
      <Route path="/responsaveis" element={privatePage(<Responsibles />)} />
      <Route path="/relatorios" element={privatePage(<Reports />)} />
      <Route path="/configuracoes" element={privatePage(<Settings />)} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
