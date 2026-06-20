import { useMemo, useState, type FormEvent } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { occurrenceCategories } from '../data/occurrenceCategories'
import { loadEmployees } from '../services/employeeStorage'
import {
  loadResponsibles,
  saveResponsibles,
  type ResponsibleAssignment,
} from '../services/responsibleStorage'
import { loadStores } from '../services/storeStorage'

const emptyForm = {
  employeeRegistration: '',
  store: '',
  category: '',
  shift: '',
  status: 'Disponível' as ResponsibleAssignment['status'],
  isPrimary: false,
}

export default function Responsibles() {
  const employees = useMemo(() => loadEmployees(), [])
  const stores = useMemo(() => loadStores(), [])
  const [responsibles, setResponsibles] = useState<ResponsibleAssignment[]>(loadResponsibles)
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [storeFilter, setStoreFilter] = useState('Todas')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [message, setMessage] = useState('')

  const selectedEmployee = employees.find(
    (employee) => employee.registration === form.employeeRegistration,
  )

  const filteredResponsibles = useMemo(() => {
    const term = search.toLocaleLowerCase('pt-BR').trim()
    return responsibles.filter((responsible) => {
      const matchesSearch = !term || [
        responsible.employeeName,
        responsible.employeeRegistration,
        responsible.category,
        responsible.role,
      ].some((value) => value.toLocaleLowerCase('pt-BR').includes(term))
      const matchesStore = storeFilter === 'Todas' || responsible.store === storeFilter
      const matchesStatus = statusFilter === 'Todos' || responsible.status === statusFilter
      return matchesSearch && matchesStore && matchesStatus
    })
  }, [responsibles, search, statusFilter, storeFilter])

  const summary = useMemo(() => ({
    total: responsibles.length,
    available: responsibles.filter((item) => item.status === 'Disponível').length,
    primary: responsibles.filter((item) => item.isPrimary).length,
    uncovered: occurrenceCategories.filter((category) =>
      !responsibles.some((item) => item.category === category.name && item.status === 'Disponível'),
    ).length,
  }), [responsibles])

  function persist(nextResponsibles: ResponsibleAssignment[]) {
    try {
      saveResponsibles(nextResponsibles)
      setResponsibles(nextResponsibles)
      return true
    } catch {
      setMessage('Não foi possível salvar a atribuição.')
      return false
    }
  }

  function openNewAssignment() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function editAssignment(assignment: ResponsibleAssignment) {
    setEditingId(assignment.id)
    setForm({
      employeeRegistration: assignment.employeeRegistration,
      store: assignment.store,
      category: assignment.category,
      shift: assignment.shift,
      status: assignment.status,
      isPrimary: assignment.isPrimary,
    })
    setShowForm(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedEmployee || !form.store || !form.category || !form.shift) {
      setMessage('Selecione colaborador, loja, categoria e turno.')
      return
    }

    const duplicate = responsibles.some((item) =>
      item.id !== editingId &&
      item.employeeRegistration === form.employeeRegistration &&
      item.store === form.store &&
      item.category === form.category,
    )
    if (duplicate) {
      setMessage('Este colaborador já responde por essa categoria nesta loja.')
      return
    }

    let nextResponsibles = responsibles
    if (form.isPrimary) {
      nextResponsibles = nextResponsibles.map((item) =>
        item.store === form.store && item.category === form.category
          ? { ...item, isPrimary: false }
          : item,
      )
    }

    const assignment: ResponsibleAssignment = {
      id: editingId || `responsible-${Date.now()}`,
      employeeRegistration: selectedEmployee.registration,
      employeeName: selectedEmployee.name,
      role: selectedEmployee.role,
      store: form.store,
      category: form.category,
      shift: form.shift,
      phone: selectedEmployee.phone,
      email: selectedEmployee.email,
      status: form.status,
      isPrimary: form.isPrimary,
    }

    nextResponsibles = editingId
      ? nextResponsibles.map((item) => item.id === editingId ? assignment : item)
      : [assignment, ...nextResponsibles]

    if (persist(nextResponsibles)) {
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
      setMessage(editingId ? 'Responsável atualizado.' : 'Responsável atribuído com sucesso.')
    }
  }

  function removeAssignment(assignment: ResponsibleAssignment) {
    if (persist(responsibles.filter((item) => item.id !== assignment.id))) {
      setMessage('Atribuição removida.')
    }
  }

  function openWhatsApp(responsible: ResponsibleAssignment) {
    const phone = responsible.phone.replace(/\D/g, '')
    if (!phone) {
      setMessage('Este responsável não possui telefone cadastrado.')
      return
    }
    const text = encodeURIComponent(
      `Olá, ${responsible.employeeName}. Você está como responsável por ${responsible.category} na ${responsible.store}.`,
    )
    window.open(`https://wa.me/55${phone}?text=${text}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <AppLayout title="Responsáveis">
      {message && (
        <div className="notification-overlay" role="presentation" onClick={() => setMessage('')}>
          <div className="page-notification" role="alertdialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <span className="notification-icon" aria-hidden="true">!</span>
            <p>{message}</p>
            <button type="button" onClick={() => setMessage('')}>Entendi</button>
          </div>
        </div>
      )}

      <section className="responsible-summary">
        <article><span>👤</span><div><strong>{summary.total}</strong><p>Atribuições</p></div></article>
        <article><span>✅</span><div><strong>{summary.available}</strong><p>Disponíveis</p></div></article>
        <article><span>⭐</span><div><strong>{summary.primary}</strong><p>Responsáveis principais</p></div></article>
        <article className={summary.uncovered ? 'warning' : ''}><span>⚠️</span><div><strong>{summary.uncovered}</strong><p>Categorias sem cobertura</p></div></article>
      </section>

      <section className="responsible-list-card">
        <div className="responsible-list-header">
          <div>
            <h2>Matriz de responsáveis</h2>
            <p>Defina quem atende cada categoria por loja e turno.</p>
          </div>
          <button className="primary-button" type="button" onClick={openNewAssignment} disabled={!employees.length}>
            + Atribuir responsável
          </button>
        </div>

        {!employees.length && (
          <div className="responsible-alert">
            <span>ℹ️</span>
            <div><strong>Sincronize os colaboradores primeiro</strong><p>Acesse Colaboradores e execute a integração simulada com o RH.</p></div>
          </div>
        )}

        <div className="responsible-filters">
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar responsável, matrícula ou categoria..." />
          <select value={storeFilter} onChange={(event) => setStoreFilter(event.target.value)}>
            <option>Todas</option>
            {stores.map((store) => <option key={store.id}>{store.name}</option>)}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option>Todos</option><option>Disponível</option><option>Indisponível</option><option>Férias</option>
          </select>
        </div>

        {filteredResponsibles.length ? (
          <div className="responsible-grid">
            {filteredResponsibles.map((responsible) => (
              <article className="responsible-card" key={responsible.id}>
                <div className="responsible-card-top">
                  <div className="responsible-avatar">{responsible.employeeName.split(' ').slice(0, 2).map((name) => name[0]).join('')}</div>
                  <div><h3>{responsible.employeeName}</h3><p>{responsible.role} • {responsible.employeeRegistration}</p></div>
                  {responsible.isPrimary && <span className="primary-badge">Principal</span>}
                </div>
                <dl>
                  <div><dt>Loja</dt><dd>{responsible.store}</dd></div>
                  <div><dt>Categoria</dt><dd>{responsible.category}</dd></div>
                  <div><dt>Turno</dt><dd>{responsible.shift}</dd></div>
                  <div><dt>Status</dt><dd><span className={`responsible-status ${responsible.status.toLowerCase()}`}>{responsible.status}</span></dd></div>
                </dl>
                <div className="responsible-card-actions">
                  <button type="button" onClick={() => openWhatsApp(responsible)}>WhatsApp</button>
                  <button type="button" onClick={() => editAssignment(responsible)}>Editar</button>
                  <button className="danger" type="button" onClick={() => removeAssignment(responsible)}>Remover</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="employee-empty"><span>👤</span><h3>Nenhum responsável atribuído</h3><p>Crie a primeira atribuição para organizar o atendimento das ocorrências.</p></div>
        )}
      </section>

      {showForm && (
        <div className="store-modal-overlay">
          <section className="store-modal" role="dialog" aria-modal="true" aria-label="Atribuir responsável">
            <div className="store-modal-header">
              <div><h2>{editingId ? 'Editar responsável' : 'Atribuir responsável'}</h2><p>Os dados pessoais vêm da integração com o RH.</p></div>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Fechar">×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <label>Colaborador *
                <select value={form.employeeRegistration} onChange={(event) => {
                  const employee = employees.find((item) => item.registration === event.target.value)
                  setForm({ ...form, employeeRegistration: event.target.value, store: employee?.store || form.store, shift: employee?.shift || form.shift })
                }}>
                  <option value="">Selecione</option>
                  {employees.filter((employee) => employee.status === 'Ativo').map((employee) => (
                    <option value={employee.registration} key={employee.registration}>{employee.name} • {employee.role}</option>
                  ))}
                </select>
              </label>
              <div className="form-grid">
                <label>Loja *
                  <select value={form.store} onChange={(event) => setForm({ ...form, store: event.target.value })}>
                    <option value="">Selecione</option>{stores.filter((store) => store.status === 'Ativa').map((store) => <option key={store.id}>{store.name}</option>)}
                  </select>
                </label>
                <label>Turno *
                  <select value={form.shift} onChange={(event) => setForm({ ...form, shift: event.target.value })}>
                    <option value="">Selecione</option><option>Manhã</option><option>Tarde</option><option>Noite</option><option>Comercial</option><option>Plantão</option>
                  </select>
                </label>
              </div>
              <label>Categoria atendida *
                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                  <option value="">Selecione</option>{occurrenceCategories.map((category) => <option key={category.name}>{category.name}</option>)}
                </select>
              </label>
              <div className="form-grid">
                <label>Status
                  <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as ResponsibleAssignment['status'] })}>
                    <option>Disponível</option><option>Indisponível</option><option>Férias</option>
                  </select>
                </label>
                <label className="responsible-primary-option">
                  <input type="checkbox" checked={form.isPrimary} onChange={(event) => setForm({ ...form, isPrimary: event.target.checked })} />
                  <span>Responsável principal</span>
                </label>
              </div>
              {selectedEmployee && <div className="employee-source-preview"><strong>{selectedEmployee.name}</strong><span>{selectedEmployee.phone} • {selectedEmployee.email}</span></div>}
              <div className="store-modal-actions">
                <button type="button" onClick={() => setShowForm(false)}>Cancelar</button>
                <button className="primary-button" type="submit">Salvar atribuição</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </AppLayout>
  )
}
