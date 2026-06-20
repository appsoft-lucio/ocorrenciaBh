import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthFooter from '../components/auth/AuthFooter'
import { demoCredentials, requestPasswordReset } from '../services/authStorage'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState(demoCredentials.email)
  const [error, setError] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!requestPasswordReset(email)) {
      setError('Não encontramos uma conta com esse e-mail.')
      return
    }
    navigate('/nova-senha', { state: { demoLinkSent: true } })
  }

  return (
    <main className="auth-page simple">
      <section className="auth-form-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-mobile-logo">BH</div>
          <div className="auth-heading"><span>RECUPERAÇÃO DE ACESSO</span><h2>Esqueceu sua senha?</h2><p>Informe seu e-mail. Enviaremos um link temporário para criar uma nova senha.</p></div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <label>E-mail corporativo<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <button className="auth-submit" type="submit">Enviar link de recuperação</button>
          <Link className="auth-back-link" to="/login">← Voltar ao login</Link>
        </form>
        <AuthFooter />
      </section>
    </main>
  )
}
