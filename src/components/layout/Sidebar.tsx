import { NavLink } from 'react-router-dom'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Ocorrências', path: '/ocorrencias' },
  { label: 'Lojas', path: '/lojas' },
  { label: 'Colaboradores', path: '/colaboradores' },
  { label: 'Responsáveis', path: '/responsaveis' },
  { label: 'Relatórios', path: '/relatorios' },
  { label: 'Configurações', path: '/configuracoes' },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      <aside className={isOpen ? 'sidebar open' : 'sidebar'}>
        <div className="sidebar-logo">
          <div className="bh-logo">BH</div>
          <strong>Ocorrências</strong>
          <span>Ocorrências BH</span>
        </div>

        <nav aria-label="Menu principal">
          <ul>
            {navigation.map((item) => (
              <li key={item.path}>
                <NavLink
                  className={({ isActive }) => isActive ? 'active' : ''}
                  to={item.path}
                  onClick={onClose}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <button type="button" className="sidebar-footer">Sair</button>
      </aside>

      {isOpen && <button className="overlay" aria-label="Fechar menu" onClick={onClose} />}
    </>
  )
}
