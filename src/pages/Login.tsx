import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthFooter from '../components/auth/AuthFooter'
import { demoCredentials, getSession, login } from '../services/authStorage'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(demoCredentials.email)
  const [password, setPassword] = useState(demoCredentials.password)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  if (getSession()) return <Navigate to="/dashboard" replace />

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!login(email, password)) {
      setError('E-mail ou senha incorretos.')
      return
    }
    const from = (location.state as { from?: string } | null)?.from || '/dashboard'
    navigate(from, { replace: true })
  }

  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <div className="auth-brand">
          <div className="auth-bh-logo">BH</div>
          <h1>Ocorrências BH</h1>
          <p>Gestão simples e segura das ocorrências operacionais.</p>
        </div>
        <div className="auth-features">
          <span>✓ Registro de ocorrências</span>
          <span>✓ Gestão por loja e região</span>
          <span>✓ Responsáveis e relatórios</span>
        </div>
      </section>

      <section className="auth-form-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-mobile-logo">BH</div>
          <div className="auth-heading"><span>ACESSO AO SISTEMA</span><h2>Entre na sua conta</h2><p>Use seu e-mail corporativo e sua senha.</p></div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <label>E-mail<input type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label>Senha
            <div className="password-input">
              <input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
              <button type="button" onClick={() => setShowPassword((current) => !current)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button>
            </div>
          </label>
          <Link className="forgot-link" to="/recuperar-senha">Esqueci minha senha</Link>
          <button className="auth-submit" type="submit">Entrar</button>
          <div className="demo-credentials"><strong>Acesso de demonstração</strong><span>{demoCredentials.email}</span><span>Senha: {demoCredentials.password}</span></div>
        </form>
        <AuthFooter />
      </section>
    </main>
  )
}
