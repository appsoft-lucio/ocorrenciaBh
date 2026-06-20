import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getSession } from '../../services/authStorage'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation()
  return getSession()
    ? children
    : <Navigate to="/login" replace state={{ from: location.pathname }} />
}
