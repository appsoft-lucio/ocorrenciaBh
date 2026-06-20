import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { occurrenceCategories } from '../data/occurrenceCategories'
import { loadEmployees } from '../services/employeeStorage'
import { loadOccurrences } from '../services/occurrenceStorage'
import { loadResponsibles } from '../services/responsibleStorage'
import { loadSettings, saveSettings, type AppSettings } from '../services/settingsStorage'
import { loadStores } from '../services/storeStorage'

type SettingsTab = 'Geral' | 'Ocorrências' | 'Acessibilidade' | 'Dados'

interface CustomCategory {
  id: string
  name: string
  occurrences: string[]
}

const CUSTOM_CATEGORIES_KEY = 'categoriasPersonalizadasBh'

function loadCustomCategories(): CustomCategory[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(CUSTOM_CATEGORIES_KEY) || '[]')
    return Array.isArray(parsed) ? parsed as CustomCategory[] : []
  } catch {
    return []
  }
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('Geral')
  const [settings, setSettings] = useState<AppSettings>(loadSettings)
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(loadCustomCategories)
  const [categoryName, setCategoryName] = useState('')
  const [occurrenceName, setOccurrenceName] = useState('')
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [message, setMessage] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)

  const stores = useMemo(() => loadStores(), [])
  const employees = useMemo(() => loadEmployees(), [])
  const storageSummary = useMemo(() => ({
    stores: stores.length,
    employees: employees.length,
    occurrences: loadOccurrences().length,
    responsibles: loadResponsibles().length,
  }), [employees.length, stores.length])

  function updateSetting<Key extends keyof AppSettings>(key: Key, value: AppSettings[Key]) {
    setSettings((current) => ({ ...current, [key]: value }))
  }

  function persistSettings() {
    saveSettings(settings)
    setMessage('Configurações salvas com sucesso.')
  }

  function persistCategories(categories: CustomCategory[]) {
    localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories))
    setCustomCategories(categories)
  }

  function addCategory() {
    const name = categoryName.trim()
    if (!name) {
      setMessage('Informe o nome da categoria.')
      return
    }
    const duplicate = [...occurrenceCategories, ...customCategories].some(
      (category) => category.name.toLocaleLowerCase('pt-BR') === name.toLocaleLowerCase('pt-BR'),
    )
    if (duplicate) {
      setMessage('Já existe uma categoria com esse nome.')
      return
    }
    const category = { id: `category-${Date.now()}`, name, occurrences: [] }
    persistCategories([...customCategories, category])
    setSelectedCategoryId(category.id)
    setCategoryName('')
    setMessage('Categoria personalizada adicionada.')
  }

  function addOccurrenceType() {
    const name = occurrenceName.trim()
    if (!selectedCategoryId || !name) {
      setMessage('Selecione uma categoria personalizada e informe a ocorrência.')
      return
    }
    const nextCategories = customCategories.map((category) =>
      category.id === selectedCategoryId && !category.occurrences.includes(name)
        ? { ...category, occurrences: [...category.occurrences, name] }
        : category,
    )
    persistCategories(nextCategories)
    setOccurrenceName('')
    setMessage('Tipo de ocorrência adicionado.')
  }

  function exportBackup() {
    const backup: Record<string, unknown> = {}
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (key?.toLocaleLowerCase('pt-BR').includes('bh') || key?.startsWith('accessibility')) {
        backup[key] = localStorage.getItem(key)
      }
    }
    const content = JSON.stringify({ exportedAt: new Date().toISOString(), data: backup }, null, 2)
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `backup-ocorrencias-bh-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  function importBackup(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const backup = JSON.parse(String(reader.result)) as { data?: Record<string, string> }
        if (!backup.data || typeof backup.data !== 'object') throw new Error()
        Object.entries(backup.data).forEach(([key, value]) => localStorage.setItem(key, value))
        setMessage('Backup restaurado. Atualize a página para carregar todos os dados.')
      } catch {
        setMessage('O arquivo selecionado não é um backup válido.')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  function resetLocalData() {
    const keys = ['ocorrenciasBh', 'lojasBh', 'colaboradoresBh', 'colaboradoresBhUltimaSincronizacao', 'responsaveisBh', CUSTOM_CATEGORIES_KEY]
    keys.forEach((key) => localStorage.removeItem(key))
    setConfirmReset(false)
    setMessage('Dados operacionais removidos. As configurações foram preservadas.')
  }

  return (
    <AppLayout title="Configurações">
      {message && (
        <div className="notification-overlay" role="presentation" onClick={() => setMessage('')}>
          <div className="page-notification" role="alertdialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <span className="notification-icon" aria-hidden="true">!</span><p>{message}</p>
            <button type="button" onClick={() => setMessage('')}>Entendi</button>
          </div>
        </div>
      )}

      <section className="settings-header">
        <div><h2>Configurações do sistema</h2><p>Personalize o funcionamento e gerencie os dados armazenados.</p></div>
        <button type="button" onClick={persistSettings}>Salvar alterações</button>
      </section>

      <div className="settings-layout">
        <nav className="settings-tabs" aria-label="Seções de configuração">
          {(['Geral', 'Ocorrências', 'Acessibilidade', 'Dados'] as const).map((tab) => (
            <button className={activeTab === tab ? 'active' : ''} type="button" onClick={() => setActiveTab(tab)} key={tab}>{tab}</button>
          ))}
        </nav>

        <section className="settings-content">
          {activeTab === 'Geral' && (
            <div className="settings-section">
              <div className="settings-title"><h3>Informações gerais</h3><p>Nome e padrões utilizados no sistema.</p></div>
              <div className="settings-form-grid">
                <label>Nome da empresa<input value={settings.companyName} onChange={(event) => updateSetting('companyName', event.target.value)} /></label>
                <label>Nome do sistema<input value={settings.systemName} onChange={(event) => updateSetting('systemName', event.target.value)} /></label>
                <label>Loja padrão<select value={settings.defaultStore} onChange={(event) => updateSetting('defaultStore', event.target.value)}><option value="">Nenhuma</option>{stores.map((store) => <option key={store.id}>{store.name}</option>)}</select></label>
                <label>Responsável padrão<select value={settings.defaultResponsible} onChange={(event) => updateSetting('defaultResponsible', event.target.value)}><option value="">Nenhum</option><option>Fiscal</option><option>Gerente</option><option>RH</option><option>Manutenção</option><option>Prevenção de Perdas</option><option>Diretoria</option></select></label>
              </div>
              <div className="settings-title divider"><h3>Notificações</h3><p>Como os responsáveis devem ser avisados.</p></div>
              <label className="setting-toggle"><div><strong>Notificar responsável</strong><span>Preparar aviso quando uma ocorrência for registrada.</span></div><input type="checkbox" checked={settings.notifyResponsible} onChange={(event) => updateSetting('notifyResponsible', event.target.checked)} /></label>
              <label>Canal padrão<select disabled={!settings.notifyResponsible} value={settings.notificationChannel} onChange={(event) => updateSetting('notificationChannel', event.target.value as AppSettings['notificationChannel'])}><option>Sistema</option><option>WhatsApp</option><option>Ambos</option></select></label>
            </div>
          )}

          {activeTab === 'Ocorrências' && (
            <div className="settings-section">
              <div className="settings-title"><h3>Regras de registro</h3><p>Defina o comportamento padrão das ocorrências.</p></div>
              <label>Gravidade padrão<select value={settings.defaultPriority} onChange={(event) => updateSetting('defaultPriority', event.target.value)}><option>Baixa</option><option>Média</option><option>Alta</option><option>Crítica</option></select></label>
              <label className="setting-toggle"><div><strong>Exigir foto em ocorrência crítica</strong><span>O registro só poderá ser salvo após anexar uma imagem.</span></div><input type="checkbox" checked={settings.requireImageForCritical} onChange={(event) => updateSetting('requireImageForCritical', event.target.checked)} /></label>
              <label className="setting-toggle"><div><strong>Permitir comando de voz</strong><span>Habilita ditado nos campos de descrição e “Outro”.</span></div><input type="checkbox" checked={settings.allowVoiceInput} onChange={(event) => updateSetting('allowVoiceInput', event.target.checked)} /></label>

              <div className="settings-title divider"><h3>Categorias personalizadas</h3><p>As categorias oficiais permanecem protegidas; adicione opções complementares.</p></div>
              <div className="settings-inline-form"><input value={categoryName} onChange={(event) => setCategoryName(event.target.value)} placeholder="Nome da nova categoria" /><button type="button" onClick={addCategory}>Adicionar</button></div>
              <div className="custom-category-list">
                {customCategories.map((category) => (
                  <article className={selectedCategoryId === category.id ? 'selected' : ''} key={category.id} onClick={() => setSelectedCategoryId(category.id)}>
                    <div><strong>{category.name}</strong><span>{category.occurrences.length} ocorrência(s)</span></div>
                    <button type="button" onClick={(event) => { event.stopPropagation(); persistCategories(customCategories.filter((item) => item.id !== category.id)) }}>Remover</button>
                  </article>
                ))}
                {!customCategories.length && <p className="dashboard-empty">Nenhuma categoria personalizada.</p>}
              </div>
              <div className="settings-inline-form"><input value={occurrenceName} onChange={(event) => setOccurrenceName(event.target.value)} placeholder="Novo tipo de ocorrência" /><button type="button" onClick={addOccurrenceType}>Adicionar ao grupo</button></div>
            </div>
          )}

          {activeTab === 'Acessibilidade' && (
            <div className="settings-section">
              <div className="settings-title"><h3>Acessibilidade</h3><p>Melhore a leitura e a utilização em celulares.</p></div>
              <label className="setting-toggle"><div><strong>Texto ampliado</strong><span>Aumenta textos, campos e botões em todo o sistema.</span></div><input type="checkbox" checked={settings.largeText} onChange={(event) => updateSetting('largeText', event.target.checked)} /></label>
              <label className="setting-toggle"><div><strong>Alto contraste</strong><span>Utiliza cores mais fortes e bordas mais visíveis.</span></div><input type="checkbox" checked={settings.highContrast} onChange={(event) => updateSetting('highContrast', event.target.checked)} /></label>
              <div className="accessibility-preview"><span>Aa</span><div><strong>Prévia de leitura</strong><p>Este texto demonstra como ficará a interface para o usuário.</p></div></div>
            </div>
          )}

          {activeTab === 'Dados' && (
            <div className="settings-section">
              <div className="settings-title"><h3>Dados locais</h3><p>Backup, restauração e limpeza dos registros deste navegador.</p></div>
              <div className="data-summary">
                <article><strong>{storageSummary.stores}</strong><span>Lojas</span></article>
                <article><strong>{storageSummary.employees}</strong><span>Colaboradores</span></article>
                <article><strong>{storageSummary.occurrences}</strong><span>Ocorrências</span></article>
                <article><strong>{storageSummary.responsibles}</strong><span>Responsáveis</span></article>
              </div>
              <div className="data-actions">
                <button type="button" onClick={exportBackup}>Baixar backup</button>
                <button type="button" onClick={() => importInputRef.current?.click()}>Restaurar backup</button>
                <input ref={importInputRef} hidden type="file" accept="application/json" onChange={importBackup} />
                <button className="danger" type="button" onClick={() => setConfirmReset(true)}>Limpar dados operacionais</button>
              </div>
              <p className="data-warning">Os dados estão apenas neste navegador. Faça backup antes de limpar ou trocar de dispositivo.</p>
            </div>
          )}
        </section>
      </div>

      {confirmReset && (
        <div className="notification-overlay">
          <div className="page-notification" role="alertdialog" aria-modal="true">
            <span className="notification-icon" aria-hidden="true">!</span><p>Deseja apagar lojas, colaboradores, ocorrências e responsáveis deste navegador?</p>
            <div className="confirm-actions"><button type="button" onClick={() => setConfirmReset(false)}>Cancelar</button><button className="danger" type="button" onClick={resetLocalData}>Apagar dados</button></div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
