import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import AuthFooter from '../components/auth/AuthFooter'
import { hasValidPasswordReset, resetPassword } from '../services/authStorage'

export default function ResetPassword() {
  const location = useLocation()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  if (!hasValidPasswordReset() && !success) return <Navigate to="/recuperar-senha" replace />

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setMessage('Use pelo menos 8 caracteres, uma letra maiúscula e um número.')
      return
    }
    if (password !== confirmation) {
      setMessage('As senhas não correspondem.')
      return
    }
    if (!resetPassword(password)) {
      setMessage('O link expirou. Solicite uma nova recuperação.')
      return
    }
    setSuccess(true)
  }

  return (
    <main className="auth-page simple">
      <section className="auth-form-panel">
        <form className="auth-card" onSubmit={handleSubmit}>
          <div className="auth-mobile-logo">BH</div>
          {success ? (
            <div className="auth-success"><span>✓</span><h2>Senha atualizada</h2><p>Agora você já pode entrar com a nova senha.</p><Link className="auth-submit link-button" to="/login">Ir para o login</Link></div>
          ) : (
            <>
              <div className="auth-heading"><span>NOVO ACESSO</span><h2>Crie uma nova senha</h2><p>{(location.state as { demoLinkSent?: boolean } | null)?.demoLinkSent ? 'Link simulado validado. ' : ''}Ele é válido por 30 minutos.</p></div>
              {message && <p className="auth-error" role="alert">{message}</p>}
              <label>Nova senha<input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
              <label>Confirmar nova senha<input type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label>
              <button className="auth-submit" type="submit">Salvar nova senha</button>
            </>
          )}
        </form>
        <AuthFooter />
      </section>
    </main>
  )
}
