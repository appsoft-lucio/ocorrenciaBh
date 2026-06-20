import Icon from '../ui/Icon'

interface HeaderProps {
  onOpenMenu: () => void
  title?: string
}

export default function Header({ onOpenMenu, title = 'Dashboard' }: HeaderProps) {
  return (
    <header className="header">
      <button className="mobile-menu" onClick={onOpenMenu} aria-label="Abrir menu">
        <Icon name="menu" />
      </button>

      <div className="header-left">
        <div>
          <h1>{title}</h1>
          <p>Ocorrências Supermercados BH</p>
        </div>
      </div>

      <div className="header-user">
        <span>👤 Gerente Matriz</span>
        <button type="button">Sair</button>
      </div>
    </header>
  )
}
