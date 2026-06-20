import { useState, type FormEvent } from 'react'
import appSoftLogo from '../assets/logo-appsoft-orange.png'
import AppLayout from '../components/layout/AppLayout'

type SettingsTab = 'Perfil' | 'Segurança' | 'Recuperar senha' | 'Sobre o app'

interface UserProfile {
  name: string
  email: string
  recoveryEmail: string
  phone: string
  registration: string
  role: string
  store: string
}

const PROFILE_KEY = 'perfilUsuarioBh'
const PASSWORD_KEY = 'senhaUsuarioBh'

const defaultProfile: UserProfile = {
  name: 'Gerente Matriz',
  email: 'gerente.matriz@empresa.com.br',
  recoveryEmail: '',
  phone: '(31) 99999-0000',
  registration: 'BH-ADMIN-001',
  role: 'Administrador',
  store: 'Matriz',
}

function loadProfile(): UserProfile {
  try {
    return {
      ...defaultProfile,
      ...JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}'),
    } as UserProfile
  } catch {
    return defaultProfile
  }
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Perfil')
  const [profile, setProfile] = useState<UserProfile>(loadProfile)
  const [password, setPassword] = useState({
    current: '',
    next: '',
    confirmation: '',
  })
  const [recoveryEmail, setRecoveryEmail] = useState(profile.recoveryEmail || profile.email)
  const [message, setMessage] = useState('')

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!profile.name.trim() || !profile.email.trim()) {
      setMessage('Informe o nome e o e-mail principal.')
      return
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
    setMessage('Perfil atualizado com sucesso.')
  }

  function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const savedPassword = localStorage.getItem(PASSWORD_KEY) || '123456'

    if (password.current !== savedPassword) {
      setMessage('A senha atual está incorreta. Para esta demonstração, a senha inicial é 123456.')
      return
    }
    if (password.next.length < 8) {
      setMessage('A nova senha deve ter pelo menos 8 caracteres.')
      return
    }
    if (!/[A-Z]/.test(password.next) || !/[0-9]/.test(password.next)) {
      setMessage('Use pelo menos uma letra maiúscula e um número na nova senha.')
      return
    }
    if (password.next !== password.confirmation) {
      setMessage('A confirmação não corresponde à nova senha.')
      return
    }

    localStorage.setItem(PASSWORD_KEY, password.next)
    setPassword({ current: '', next: '', confirmation: '' })
    setMessage('Senha alterada com sucesso.')
  }

  function requestPasswordRecovery(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!recoveryEmail.includes('@')) {
      setMessage('Informe um e-mail válido para recuperação.')
      return
    }

    const nextProfile = { ...profile, recoveryEmail }
    setProfile(nextProfile)
    localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile))
    setMessage(`Simulação concluída: um link de recuperação seria enviado para ${recoveryEmail}.`)
  }

  return (
    <AppLayout title="Configurações">
      {message && (
        <div className="notification-overlay" role="presentation" onClick={() => setMessage('')}>
          <div className="page-notification" role="alertdialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <span className="notification-icon" aria-hidden="true">!</span>
            <p>{message}</p>
            <button type="button" onClick={() => setMessage('')}>Entendi</button>
          </div>
        </div>
      )}

      <section className="settings-header">
        <div>
          <h2>Minha conta</h2>
          <p>Atualize seus dados pessoais, senha e opções de recuperação.</p>
        </div>
      </section>

      <div className="settings-layout">
        <nav className="settings-tabs" aria-label="Seções da conta">
          {(['Perfil', 'Segurança', 'Recuperar senha', 'Sobre o app'] as const).map((tab) => (
            <button className={activeTab === tab ? 'active' : ''} type="button" onClick={() => setActiveTab(tab)} key={tab}>
              {tab}
            </button>
          ))}
        </nav>

        <section className="settings-content">
          {activeTab === 'Perfil' && (
            <form className="settings-section" onSubmit={saveProfile}>
              <div className="profile-heading">
                <div className="profile-avatar">{profile.name.split(' ').slice(0, 2).map((name) => name[0]).join('')}</div>
                <div><h3>{profile.name}</h3><p>{profile.role} • {profile.store}</p></div>
              </div>

              <div className="settings-title">
                <h3>Dados pessoais</h3>
                <p>Essas informações serão usadas para identificar suas ações no sistema.</p>
              </div>

              <div className="settings-form-grid">
                <label>Nome completo *<input value={profile.name} onChange={(event) => setProfile({ ...profile, name: event.target.value })} /></label>
                <label>E-mail de acesso *<input type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} /></label>
                <label>Telefone / WhatsApp<input value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label>
                <label>Matrícula<input value={profile.registration} readOnly /></label>
                <label>Perfil de acesso<input value={profile.role} readOnly /></label>
                <label>Unidade<input value={profile.store} readOnly /></label>
              </div>

              <p className="readonly-note">Matrícula, perfil e unidade são definidos pelo administrador ou pela integração com o RH.</p>
              <button className="settings-save-button" type="submit">Salvar perfil</button>
            </form>
          )}

          {activeTab === 'Segurança' && (
            <form className="settings-section" onSubmit={changePassword}>
              <div className="settings-title"><h3>Alterar senha</h3><p>Escolha uma senha segura e diferente da atual.</p></div>
              <div className="password-guidance">
                <strong>A nova senha deve conter:</strong>
                <span>• No mínimo 8 caracteres</span>
                <span>• Uma letra maiúscula</span>
                <span>• Pelo menos um número</span>
              </div>
              <label>Senha atual<input type="password" autoComplete="current-password" value={password.current} onChange={(event) => setPassword({ ...password, current: event.target.value })} /></label>
              <label>Nova senha<input type="password" autoComplete="new-password" value={password.next} onChange={(event) => setPassword({ ...password, next: event.target.value })} /></label>
              <label>Confirmar nova senha<input type="password" autoComplete="new-password" value={password.confirmation} onChange={(event) => setPassword({ ...password, confirmation: event.target.value })} /></label>
              <button className="settings-save-button" type="submit">Alterar senha</button>
              <small className="demo-security-note">Demonstração local: a senha inicial é <strong>123456</strong>. Em produção, senhas nunca serão armazenadas no navegador.</small>
            </form>
          )}

          {activeTab === 'Recuperar senha' && (
            <form className="settings-section" onSubmit={requestPasswordRecovery}>
              <div className="recovery-icon" aria-hidden="true">✉</div>
              <div className="settings-title centered">
                <h3>Recuperação de acesso</h3>
                <p>Informe o e-mail que receberá o link para criar uma nova senha.</p>
              </div>
              <label>E-mail de recuperação<input type="email" value={recoveryEmail} onChange={(event) => setRecoveryEmail(event.target.value)} placeholder="seu.email@empresa.com.br" /></label>
              <button className="settings-save-button" type="submit">Enviar link de recuperação</button>
              <div className="recovery-help">
                <strong>Não possui acesso ao e-mail?</strong>
                <p>Solicite ao administrador ou ao RH a atualização do seu cadastro.</p>
              </div>
            </form>
          )}

          {activeTab === 'Sobre o app' && (
            <div className="settings-section about-app">
              <div className="about-logo">BH</div>
              <div><h3>Ocorrências BH</h3><p className="about-version">Versão 1.0.0 • Aplicação web</p></div>
              <p>Sistema para registro e acompanhamento de ocorrências operacionais, responsáveis, lojas e relatórios.</p>
              <div className="about-features">
                <article><span>📝</span><div><strong>Registro de ocorrências</strong><p>Cadastro guiado, foto e comando de voz.</p></div></article>
                <article><span>🏪</span><div><strong>Gestão de lojas</strong><p>Unidades, colaboradores e responsáveis.</p></div></article>
                <article><span>📊</span><div><strong>Relatórios</strong><p>Indicadores e exportação para Excel.</p></div></article>
                <article><span>♿</span><div><strong>Acessibilidade</strong><p>Texto ampliado e alto contraste no cabeçalho.</p></div></article>
              </div>
              <div className="developer-info">
                <span>Desenvolvido e administrado por</span>
                <img src={appSoftLogo} alt="AppSoft" />
                <p>Regras do sistema, categorias e notificações são configuradas pelo desenvolvedor ou administrador autorizado.</p>
                <div className="developer-links">
                  <a href="https://appsoft-lucio.github.io/appsoft-agency/" target="_blank" rel="noreferrer">
                    Conhecer a AppSoft
                  </a>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  )
}
