import { useState, type ReactNode } from 'react'
import AppFooter from './AppFooter'
import Header from './Header'
import Sidebar from './Sidebar'

interface AppLayoutProps {
  title: string
  children: ReactNode
}

export default function AppLayout({ title, children }: AppLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="dashboard-main">
        <Header title={title} onOpenMenu={() => setMenuOpen(true)} />
        <main className="dashboard-content">
          <div className="dashboard-content-inner">{children}</div>
        </main>
        <AppFooter />
      </div>
    </div>
  )
}
