import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { occurrenceCategories } from '../data/occurrenceCategories'
import {
  loadOccurrences,
  saveOccurrences,
  type OccurrenceStatus,
  type StoredOccurrence,
} from '../services/occurrenceStorage'

type VoiceField = 'description' | 'otherType'

interface SpeechRecognitionResultEvent {
  results: ArrayLike<{
    0: { transcript: string }
  }>
}

interface SpeechRecognitionErrorEvent {
  error: string
}

interface SpeechRecognitionInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance

interface SpeechWindow extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor
  webkitSpeechRecognition?: SpeechRecognitionConstructor
}

function currentDateTime() {
  const now = new Date()
  const offset = now.getTimezoneOffset()
  return new Date(now.getTime() - offset * 60_000).toISOString().slice(0, 16)
}

function createEmptyForm() {
  return {
    store: '',
    sector: '',
    category: '',
    priority: 'Média',
    responsible: '',
    description: '',
    types: [] as string[],
    otherType: '',
    dateTime: currentDateTime(),
    image: '',
  }
}

export default function Occurrences() {
  const [occurrences, setOccurrences] = useState<StoredOccurrence[]>(loadOccurrences)
  const [form, setForm] = useState(createEmptyForm)
  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState<'Todas' | OccurrenceStatus>('Todas')
  const [message, setMessage] = useState('')
  const [listeningField, setListeningField] = useState<VoiceField | null>(null)
  const [wizardStep, setWizardStep] = useState(1)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const filteredOccurrences = useMemo(() => {
    const term = search.toLowerCase().trim()

    return occurrences.filter((occurrence) => {
      const matchesStatus = activeStatus === 'Todas' || occurrence.status === activeStatus
      const matchesSearch = !term || [occurrence.id, occurrence.title, occurrence.store, occurrence.sector]
        .some((value) => value.toLowerCase().includes(term))
      return matchesStatus && matchesSearch
    })
  }, [activeStatus, occurrences, search])

  function toggleType(type: string) {
    setForm((current) => ({
      ...current,
      types: current.types.includes(type)
        ? current.types.filter((item) => item !== type)
        : [...current.types, type],
      otherType: type === 'Outro' && current.types.includes(type) ? '' : current.otherType,
    }))
  }

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('Selecione um arquivo de imagem válido.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setForm((current) => ({ ...current, image: String(reader.result) }))
      setMessage('')
    }
    reader.readAsDataURL(file)
  }

  function capitalizeFirstLetter(text: string) {
    const trimmedText = text.trim()
    return trimmedText
      ? trimmedText.charAt(0).toLocaleUpperCase('pt-BR') + trimmedText.slice(1)
      : ''
  }

  function toggleVoiceInput(field: VoiceField) {
    if (listeningField) {
      recognitionRef.current?.stop()
      return
    }

    const speechWindow = window as SpeechWindow
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition

    if (!Recognition) {
      setMessage('O comando de voz não está disponível neste navegador.')
      return
    }

    const recognition = new Recognition()
    recognition.lang = 'pt-BR'
    recognition.continuous = true
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ')
        .trim()

      if (transcript) {
        setForm((current) => {
          const currentText = current[field]
          const recognizedText = currentText
            ? transcript
            : capitalizeFirstLetter(transcript)

          return {
            ...current,
            [field]: `${currentText}${currentText ? ' ' : ''}${recognizedText}`,
          }
        })
      }
    }

    recognition.onerror = (event) => {
      setListeningField(null)
      if (event.error !== 'aborted') {
        setMessage('Não foi possível reconhecer a fala. Tente novamente.')
      }
    }

    recognition.onend = () => {
      setListeningField(null)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    recognition.start()
    setMessage('')
    setListeningField(field)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.store || !form.sector || !form.category || !form.responsible || !form.description || !form.dateTime) {
      setMessage('Preencha os campos obrigatórios.')
      return
    }

    if (form.types.length === 0) {
      setMessage('Marque pelo menos um tipo de ocorrência.')
      return
    }

    if (form.types.includes('Outro') && !form.otherType.trim()) {
      setMessage('Especifique o tipo da ocorrência em “Outro”.')
      return
    }

    const selectedTypes = [
      ...form.types.filter((type) => type !== 'Outro'),
      ...(form.types.includes('Outro') ? [form.otherType.trim()] : []),
    ]
    const greatestNumber = occurrences.reduce((greatest, occurrence) => {
      const number = Number(occurrence.id.replace(/\D/g, ''))
      return Number.isNaN(number) ? greatest : Math.max(greatest, number)
    }, 0)
    const newOccurrence: StoredOccurrence = {
      id: `BH-${String(greatestNumber + 1).padStart(4, '0')}`,
      title: selectedTypes.join(', '),
      category: form.category,
      store: form.store,
      sector: form.sector,
      priority: form.priority,
      responsible: form.responsible,
      description: form.description,
      types: selectedTypes,
      image: form.image || undefined,
      status: 'Aberta',
      date: new Date(form.dateTime).toLocaleString('pt-BR'),
    }

    const updatedOccurrences = [newOccurrence, ...occurrences]

    try {
      saveOccurrences(updatedOccurrences)
    } catch {
      setMessage('Não foi possível salvar no armazenamento do navegador. A imagem pode estar muito grande.')
      return
    }

    setOccurrences(updatedOccurrences)
    setForm(createEmptyForm())
    setWizardStep(1)
    setMessage('Ocorrência registrada com sucesso.')
  }

  function nextWizardStep() {
    if (wizardStep === 1 && (!form.store || !form.sector)) {
      setMessage('Selecione a loja e o setor para continuar.')
      return
    }

    if (wizardStep === 2 && (!form.category || form.types.length === 0)) {
      setMessage('Selecione a categoria e pelo menos uma ocorrência.')
      return
    }

    if (wizardStep === 2 && form.types.includes('Outro') && !form.otherType.trim()) {
      setMessage('Especifique a ocorrência em “Outro” para continuar.')
      return
    }

    if (wizardStep === 3 && (!form.responsible || !form.description || !form.dateTime)) {
      setMessage('Informe o responsável, a descrição e a data para continuar.')
      return
    }

    setWizardStep((current) => Math.min(4, current + 1))
  }

  return (
    <AppLayout title="Ocorrências">
      {message && (
        <div className="notification-overlay" role="presentation" onClick={() => setMessage('')}>
          <div className="page-notification" role="alertdialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <span className="notification-icon" aria-hidden="true">!</span>
            <p>{message}</p>
            <button type="button" onClick={() => setMessage('')}>Entendi</button>
          </div>
        </div>
      )}

      <section className="occurrences-page">
        <article className="occurrence-form-card">
          <div className="section-heading">
            <h2>Nova ocorrência</h2>
            <p>Registre uma ocorrência da loja.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mobile-wizard-progress" aria-label={`Etapa ${wizardStep} de 4`}>
              <strong>Etapa {wizardStep} de 4</strong>
              <div><span style={{ width: `${wizardStep * 25}%` }} /></div>
              <p>{['Loja e setor', 'Tipo da ocorrência', 'Detalhes', 'Conferir e salvar'][wizardStep - 1]}</p>
            </div>

            <section className={`wizard-step ${wizardStep === 1 ? 'active' : ''}`}>
              <h3 className="mobile-step-title">1. Onde aconteceu?</h3>
              <div className="form-grid">
              <label>
                Loja *
                <select value={form.store} onChange={(event) => setForm({ ...form, store: event.target.value })}>
                  <option value="">Selecione</option>
                  <option>Loja 036</option>
                  <option>Loja 087</option>
                  <option>Loja 142</option>
                  <option>Loja 215</option>
                </select>
              </label>

              <label>
                Setor *
                <select value={form.sector} onChange={(event) => setForm({ ...form, sector: event.target.value })}>
                  <option value="">Selecione</option>
                  <option>Açougue</option>
                  <option>Frente de caixa</option>
                  <option>Manutenção</option>
                  <option>Padaria</option>
                  <option>Tecnologia</option>
                </select>
              </label>
            </div>
            </section>

            <section className={`wizard-step ${wizardStep === 2 ? 'active' : ''}`}>
              <h3 className="mobile-step-title">2. O que aconteceu?</h3>
              <div className="form-grid">
              <label>
                Categoria *
                <select
                  value={form.category}
                  onChange={(event) => setForm({
                    ...form,
                    category: event.target.value,
                    types: [],
                    otherType: '',
                  })}
                >
                  <option value="">Selecione</option>
                  {occurrenceCategories.map((category) => (
                    <option value={category.name} key={category.name}>
                      {category.name} ({category.type})
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Gravidade *
                <select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>
                  <option>Baixa</option>
                  <option>Média</option>
                  <option>Alta</option>
                  <option>Crítica</option>
                </select>
              </label>
            </div>

            <fieldset className="occurrence-types">
              <legend>Ocorrência *</legend>
              <p>
                {form.category
                  ? 'Marque todas as opções relacionadas ao registro.'
                  : 'Selecione primeiro uma categoria.'}
              </p>
              {form.category && (
                <div className="occurrence-types-grid">
                  {[
                    ...(occurrenceCategories.find((category) => category.name === form.category)?.occurrences ?? []),
                    'Outro',
                  ].map((type) => (
                    <label className="occurrence-type-option" key={type}>
                      <input
                        type="checkbox"
                        checked={form.types.includes(type)}
                        onChange={() => toggleType(type)}
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              )}
            </fieldset>

            {form.types.includes('Outro') && (
              <label>
                Especifique a ocorrência *
                <div className="voice-field voice-input">
                  <input
                    value={form.otherType}
                    onChange={(event) => setForm({ ...form, otherType: event.target.value })}
                    placeholder="Informe ou dite o tipo não listado"
                  />
                  <button
                    className={listeningField === 'otherType' ? 'voice-button listening' : 'voice-button'}
                    type="button"
                    onClick={() => toggleVoiceInput('otherType')}
                    aria-pressed={listeningField === 'otherType'}
                  >
                    <span aria-hidden="true">{listeningField === 'otherType' ? '■' : '🎙️'}</span>
                    {listeningField === 'otherType' ? 'Parar' : 'Usar voz'}
                  </button>
                </div>
                {listeningField === 'otherType' && <small className="voice-status">Ouvindo o tipo da ocorrência...</small>}
              </label>
            )}
            </section>

            <section className={`wizard-step ${wizardStep === 3 ? 'active' : ''}`}>
              <h3 className="mobile-step-title">3. Conte os detalhes</h3>
              <label>
              Responsável *
              <select value={form.responsible} onChange={(event) => setForm({ ...form, responsible: event.target.value })}>
                <option value="">Selecione</option>
                <option>Fiscal</option>
                <option>Gerente</option>
                <option>RH</option>
                <option>Manutenção</option>
                <option>Prevenção de Perdas</option>
                <option>Diretoria</option>
              </select>
            </label>

            <label>
              Descrição *
              <div className="voice-field voice-textarea">
                <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Descreva ou use o microfone para contar o que aconteceu..." />
                <button
                  className={listeningField === 'description' ? 'voice-button listening' : 'voice-button'}
                  type="button"
                  onClick={() => toggleVoiceInput('description')}
                  aria-pressed={listeningField === 'description'}
                >
                  <span aria-hidden="true">{listeningField === 'description' ? '■' : '🎙️'}</span>
                  {listeningField === 'description' ? 'Parar gravação' : 'Escrever por voz'}
                </button>
              </div>
              {listeningField === 'description' && <small className="voice-status">Ouvindo... fale a descrição da ocorrência.</small>}
            </label>

            <label>
              Data e hora da ocorrência *
              <input
                type="datetime-local"
                value={form.dateTime}
                onChange={(event) => setForm({ ...form, dateTime: event.target.value })}
              />
              <small className="field-help">Preenchidas automaticamente. Altere se a ocorrência aconteceu em outro horário.</small>
            </label>

            <div className="image-field">
              <label htmlFor="occurrence-image">Imagem da ocorrência (opcional)</label>
              <p>Use a câmera do celular ou escolha uma imagem do dispositivo.</p>
              <input
                id="occurrence-image"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImage}
              />
              {form.image && (
                <div className="image-preview">
                  <img src={form.image} alt="Prévia da ocorrência" />
                  <button type="button" onClick={() => setForm({ ...form, image: '' })}>Remover imagem</button>
                </div>
              )}
            </div>
            </section>

            <section className={`wizard-step wizard-review ${wizardStep === 4 ? 'active' : ''}`}>
              <h3 className="mobile-step-title">4. Confira antes de salvar</h3>
              <div className="review-list">
                <div><span>Loja e setor</span><strong>{form.store || 'Não informado'} • {form.sector || 'Não informado'}</strong></div>
                <div><span>Categoria</span><strong>{form.category || 'Não informada'}</strong></div>
                <div><span>Ocorrência</span><strong>{form.types.filter((type) => type !== 'Outro').concat(form.otherType || []).filter(Boolean).join(', ') || 'Não informada'}</strong></div>
                <div><span>Gravidade</span><strong>{form.priority}</strong></div>
                <div><span>Responsável</span><strong>{form.responsible || 'Não informado'}</strong></div>
                <div><span>Descrição</span><strong>{form.description || 'Não informada'}</strong></div>
              </div>
              <button className="primary-button" type="submit">Confirmar e salvar</button>
            </section>

            <div className="mobile-wizard-actions">
              {wizardStep > 1 && <button className="wizard-back" type="button" onClick={() => setWizardStep((current) => current - 1)}>Voltar</button>}
              {wizardStep < 4 && <button className="wizard-next" type="button" onClick={nextWizardStep}>Continuar</button>}
            </div>
          </form>
        </article>

        <section className="occurrence-consult">
          <article className="occurrence-filters">
            <div className="section-heading">
              <h2>Consultar ocorrências</h2>
              <p>{filteredOccurrences.length} registro(s) encontrado(s)</p>
            </div>

            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar protocolo, loja, setor..." />

            <div className="status-tabs">
              {(['Todas', 'Aberta', 'Em análise', 'Em andamento', 'Resolvida', 'Cancelada'] as const).map((status) => (
                <button className={activeStatus === status ? 'active' : ''} type="button" onClick={() => setActiveStatus(status)} key={status}>
                  {status}
                </button>
              ))}
            </div>
          </article>

          <div className="occurrence-list">
            {filteredOccurrences.map((occurrence) => (
              <article className="occurrence-card" key={occurrence.id}>
                <div className="occurrence-card-top">
                  <div>
                    <span className="occurrence-code">#{occurrence.id}</span>
                    <h3>{occurrence.title}</h3>
                  </div>
                  <span className={`status-badge status-${occurrence.status.toLowerCase().replace(' ', '-')}`}>{occurrence.status}</span>
                </div>
                <p>{occurrence.description}</p>
                <div className="occurrence-type-tags">
                  {occurrence.types.map((type) => <span key={type}>{type}</span>)}
                </div>
                {occurrence.image && <img className="occurrence-image" src={occurrence.image} alt={`Imagem da ocorrência ${occurrence.id}`} />}
                <div className="occurrence-meta">
                  <span>🏪 {occurrence.store}</span>
                  <span>🏷️ {occurrence.sector}</span>
                  <span>📂 {occurrence.category}</span>
                  <span>⚠️ Gravidade: {occurrence.priority}</span>
                  <span>👤 {occurrence.responsible}</span>
                  <span>🕒 {occurrence.date}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </AppLayout>
  )
}
