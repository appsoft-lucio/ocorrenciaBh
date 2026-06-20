export interface AppSettings {
  companyName: string
  systemName: string
  defaultStore: string
  defaultResponsible: string
  defaultPriority: string
  requireImageForCritical: boolean
  allowVoiceInput: boolean
  notifyResponsible: boolean
  notificationChannel: 'Sistema' | 'WhatsApp' | 'Ambos'
  largeText: boolean
  highContrast: boolean
}

const SETTINGS_STORAGE_KEY = 'configuracoesBh'

export const defaultSettings: AppSettings = {
  companyName: 'Supermercados BH',
  systemName: 'Ocorrências BH',
  defaultStore: '',
  defaultResponsible: '',
  defaultPriority: 'Média',
  requireImageForCritical: false,
  allowVoiceInput: true,
  notifyResponsible: true,
  notificationChannel: 'Sistema',
  largeText: false,
  highContrast: false,
}

export function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!stored) return defaultSettings
    return { ...defaultSettings, ...JSON.parse(stored) } as AppSettings
  } catch {
    return defaultSettings
  }
}

export function saveSettings(settings: AppSettings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  localStorage.setItem('accessibilityLargeText', String(settings.largeText))
  localStorage.setItem('accessibilityHighContrast', String(settings.highContrast))
  document.documentElement.classList.toggle('large-text', settings.largeText)
  document.documentElement.classList.toggle('high-contrast', settings.highContrast)
}
