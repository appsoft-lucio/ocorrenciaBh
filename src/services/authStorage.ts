export interface AuthUser {
  name: string
  email: string
  registration: string
  role: string
  scope: string
}

const SESSION_KEY = 'sessaoUsuarioBh'
const PROFILE_KEY = 'perfilUsuarioBh'
const PASSWORD_KEY = 'senhaUsuarioBh'
const RESET_KEY = 'recuperacaoSenhaBh'

export const demoCredentials = {
  email: 'gerente.matriz@empresa.com.br',
  password: '123456',
}

const defaultUser: AuthUser = {
  name: 'Gerente Matriz',
  email: demoCredentials.email,
  registration: 'BH-ADMIN-001',
  role: 'Gerente geral',
  scope: 'Todas as lojas',
}

function loadConfiguredUser(): AuthUser {
  try {
    const profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') as Partial<AuthUser>
    return {
      ...defaultUser,
      name: profile.name || defaultUser.name,
      email: profile.email || defaultUser.email,
      registration: profile.registration || defaultUser.registration,
      role: profile.role || defaultUser.role,
      scope: profile.scope || defaultUser.scope,
    }
  } catch {
    return defaultUser
  }
}

export function login(email: string, password: string) {
  const user = loadConfiguredUser()
  const savedPassword = localStorage.getItem(PASSWORD_KEY) || demoCredentials.password
  if (email.toLocaleLowerCase('pt-BR').trim() !== user.email.toLocaleLowerCase('pt-BR') || password !== savedPassword) {
    return null
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
  return user
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function getSession(): AuthUser | null {
  try {
    const session = localStorage.getItem(SESSION_KEY)
    return session ? JSON.parse(session) as AuthUser : null
  } catch {
    return null
  }
}

export function requestPasswordReset(email: string) {
  const user = loadConfiguredUser()
  if (email.toLocaleLowerCase('pt-BR').trim() !== user.email.toLocaleLowerCase('pt-BR')) return false
  localStorage.setItem(RESET_KEY, JSON.stringify({
    email: user.email,
    expiresAt: Date.now() + 30 * 60 * 1000,
  }))
  return true
}

export function hasValidPasswordReset() {
  try {
    const reset = JSON.parse(localStorage.getItem(RESET_KEY) || '{}') as { expiresAt?: number }
    return Boolean(reset.expiresAt && reset.expiresAt > Date.now())
  } catch {
    return false
  }
}

export function resetPassword(password: string) {
  if (!hasValidPasswordReset()) return false
  localStorage.setItem(PASSWORD_KEY, password)
  localStorage.removeItem(RESET_KEY)
  return true
}
