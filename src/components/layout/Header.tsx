import { useState } from 'react'
import Icon from '../ui/Icon'

interface HeaderProps {
  onOpenMenu: () => void
  title?: string
}

export default function Header({ onOpenMenu, title = 'Dashboard' }: HeaderProps) {
  const [largeText, setLargeText] = useState(() => localStorage.getItem('accessibilityLargeText') === 'true')
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('accessibilityHighContrast') === 'true')

  function toggleLargeText() {
    const nextValue = !largeText
    setLargeText(nextValue)
    localStorage.setItem('accessibilityLargeText', String(nextValue))
    document.documentElement.classList.toggle('large-text', nextValue)
  }

  function toggleHighContrast() {
    const nextValue = !highContrast
    setHighContrast(nextValue)
    localStorage.setItem('accessibilityHighContrast', String(nextValue))
    document.documentElement.classList.toggle('high-contrast', nextValue)
  }

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
        <div className="accessibility-controls" aria-label="Opções de acessibilidade">
          <button
            className={largeText ? 'active' : ''}
            type="button"
            onClick={toggleLargeText}
            aria-pressed={largeText}
            title="Aumentar tamanho do texto"
          >
            A+
          </button>
          <button
            className={highContrast ? 'active' : ''}
            type="button"
            onClick={toggleHighContrast}
            aria-pressed={highContrast}
            title="Ativar alto contraste"
          >
            ◐
          </button>
        </div>
        <span>👤 Gerente Matriz</span>
        <button className="logout-button" type="button">Sair</button>
      </div>
    </header>
  )
}
