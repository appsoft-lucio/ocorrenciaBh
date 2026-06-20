import { useCallback, useMemo, useState, type FormEvent } from 'react'
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
  const [assignmentStoreFilter, setAssignmentStoreFilter] = useState('Todas')
  const [assignmentShiftFilter, setAssignmentShiftFilter] = useState('Todos')
  const [assignmentRoleFilter, setAssignmentRoleFilter] = useState('')
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState('Todos')
  const [assignmentNameSearch, setAssignmentNameSearch] = useState('')
  const [message, setMessage] = useState('')

  const selectedEmployee = employees.find(
    (employee) => employee.registration === form.employeeRegistration,
  )

  const getEmployeeAvailability = useCallback((employee: (typeof employees)[number]) => {
    if (employee.status !== 'Ativo') return employee.status

    const assignments = responsibles.filter((item) =>
      item.employeeRegistration === employee.registration &&
      item.id !== editingId &&
      item.status === 'Disponível',
    )

    if (!assignments.length) return 'Disponível'

    const targetStore = assignmentStoreFilter !== 'Todas'
      ? assignmentStoreFilter
      : form.store

    if (targetStore && assignments.some((item) => item.store !== targetStore)) {
      return 'Em outra loja'
    }

    if (targetStore && assignments.some((item) => item.store === targetStore)) {
      return 'Já responsável nesta loja'
    }

    return 'Já possui atribuição'
  }, [assignmentStoreFilter, editingId, form.store, responsibles])

  const assignmentRoles = useMemo(
    () => Array.from(new Set(
      employees
        .map((employee) => employee.role),
    )).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [employees],
  )

  const selectedEmployeeAssignments = selectedEmployee
    ? responsibles.filter((item) =>
        item.employeeRegistration === selectedEmployee.registration &&
        item.id !== editingId,
      )
    : []

  const assignmentEmployees = useMemo(() => {
    const term = assignmentNameSearch.toLocaleLowerCase('pt-BR').trim()
    return employees
      .filter((employee) =>
        (assignmentStoreFilter === 'Todas' || employee.store === assignmentStoreFilter) &&
        (assignmentShiftFilter === 'Todos' || employee.shift === assignmentShiftFilter) &&
        (!assignmentRoleFilter || employee.role === assignmentRoleFilter) &&
        (assignmentStatusFilter === 'Todos' || getEmployeeAvailability(employee) === assignmentStatusFilter) &&
        (!term || employee.name.toLocaleLowerCase('pt-BR').includes(term) || employee.registration.toLocaleLowerCase('pt-BR').includes(term)),
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
  }, [assignmentNameSearch, assignmentRoleFilter, assignmentShiftFilter, assignmentStatusFilter, assignmentStoreFilter, employees, getEmployeeAvailability])

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
    setAssignmentStoreFilter('Todas')
    setAssignmentShiftFilter('Todos')
    setAssignmentRoleFilter('')
    setAssignmentStatusFilter('Todos')
    setAssignmentNameSearch('')
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
    setAssignmentRoleFilter(assignment.role)
    setAssignmentStoreFilter(assignment.store)
    setAssignmentShiftFilter(assignment.shift)
    setAssignmentStatusFilter('Todos')
    setAssignmentNameSearch(assignment.employeeName)
    setShowForm(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedEmployee || !form.store || !form.category || !form.shift) {
      setMessage('Selecione colaborador, loja, categoria e turno.')
      return
    }

    if (selectedEmployee.status !== 'Ativo') {
      setMessage(`Este colaborador está ${selectedEmployee.status.toLowerCase()} e não pode receber uma nova atribuição agora.`)
      return
    }

    if (getEmployeeAvailability(selectedEmployee) === 'Em outra loja') {
      setMessage('Este colaborador já está responsável em outra loja e não está disponível para esta escala.')
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

    const nextAssignmentNumber = responsibles.reduce((greatest, item) => {
      const number = Number(item.id.replace(/\D/g, ''))
      return Number.isNaN(number) ? greatest : Math.max(greatest, number)
    }, 0) + 1

    const assignment: ResponsibleAssignment = {
      id: editingId || `responsible-${nextAssignmentNumber}`,
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
              <label>Categoria atendida *
                <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
                  <option value="">Selecione</option>{occurrenceCategories.map((category) => <option key={category.name}>{category.name}</option>)}
                </select>
              </label>
              <div className="assignment-filter-box">
                <div className="assignment-filter-heading">
                  <strong>Filtrar colaboradores</strong>
                  <span>Use um filtro isolado ou combine vários.</span>
                </div>
                <div className="form-grid">
                  <label>Loja
                    <select value={assignmentStoreFilter} onChange={(event) => {
                      setAssignmentStoreFilter(event.target.value)
                      setForm({ ...form, employeeRegistration: '' })
                    }}>
                      <option>Todas</option>
                      {stores.filter((store) => store.status === 'Ativa').map((store) => <option key={store.id}>{store.name}</option>)}
                    </select>
                  </label>
                  <label>Turno
                    <select value={assignmentShiftFilter} onChange={(event) => {
                      setAssignmentShiftFilter(event.target.value)
                      setForm({ ...form, employeeRegistration: '' })
                    }}>
                      <option>Todos</option><option>Manhã</option><option>Tarde</option><option>Noite</option><option>Comercial</option><option>Plantão</option>
                    </select>
                  </label>
                </div>
                <div className="form-grid">
                  <label>Função
                    <select value={assignmentRoleFilter} onChange={(event) => {
                      setAssignmentRoleFilter(event.target.value)
                      setForm({ ...form, employeeRegistration: '' })
                    }}>
                      <option value="">Todas as funções</option>
                      {assignmentRoles.map((role) => <option key={role}>{role}</option>)}
                    </select>
                  </label>
                  <label>Situação
                    <select value={assignmentStatusFilter} onChange={(event) => {
                      setAssignmentStatusFilter(event.target.value)
                      setForm({ ...form, employeeRegistration: '' })
                    }}>
                      <option>Todos</option>
                      <option>Disponível</option>
                      <option>Já responsável nesta loja</option>
                      <option>Já possui atribuição</option>
                      <option>Em outra loja</option>
                      <option>Afastado</option>
                      <option>Férias</option>
                      <option>Inativo</option>
                    </select>
                  </label>
                </div>
                <label>Nome ou matrícula
                  <input
                    type="search"
                    value={assignmentNameSearch}
                    onChange={(event) => {
                      setAssignmentNameSearch(event.target.value)
                      setForm({ ...form, employeeRegistration: '' })
                    }}
                    placeholder="Digite parte do nome ou matrícula"
                  />
                </label>
              </div>

              <label>Colaborador encontrado *
                <select
                  value={form.employeeRegistration}
                  onChange={(event) => {
                    const employee = employees.find((item) => item.registration === event.target.value)
                    setForm({
                      ...form,
                      employeeRegistration: event.target.value,
                      store: employee?.store || '',
                      shift: employee?.shift || '',
                    })
                  }}
                >
                  <option value="">Selecione entre {assignmentEmployees.length} resultado(s)</option>
                  {assignmentEmployees.map((employee) => {
                    const assignments = responsibles.filter((item) => item.employeeRegistration === employee.registration)
                    const availability = getEmployeeAvailability(employee)
                    const assignmentLabel = assignments.length ? ` • ${assignments.map((item) => item.store).join(', ')}` : ''
                    return (
                      <option
                        value={employee.registration}
                        key={employee.registration}
                        disabled={['Em outra loja', 'Afastado', 'Férias', 'Inativo'].includes(availability)}
                      >
                        {availability} — {employee.name} • {employee.role} • {employee.store} • {employee.shift}{assignmentLabel}
                      </option>
                    )
                  })}
                </select>
                <small className="assignment-result-count">
                  {assignmentEmployees.length} colaborador(es) encontrado(s). Atribuições existentes aparecem ao lado do nome.
                </small>
              </label>

              {selectedEmployee && (
                <div className="selected-employee-status">
                  <div>
                    <strong>{selectedEmployee.name}</strong>
                    <span>{selectedEmployee.role} • {selectedEmployee.store} • {selectedEmployee.shift}</span>
                  </div>
                  <span className={`availability-status availability-${getEmployeeAvailability(selectedEmployee).toLocaleLowerCase('pt-BR').replaceAll(' ', '-')}`}>
                    {getEmployeeAvailability(selectedEmployee)}
                  </span>
                  {selectedEmployeeAssignments.length > 0 && (
                    <div className="existing-assignments">
                      <strong>Já é responsável por:</strong>
                      {selectedEmployeeAssignments.map((item) => (
                        <span key={item.id}>{item.store} • {item.category} • {item.shift}</span>
                      ))}
                    </div>
                  )}
                  {['Em outra loja', 'Afastado', 'Férias', 'Inativo'].includes(getEmployeeAvailability(selectedEmployee)) && (
                    <p>Este colaborador não está disponível para esta escala.</p>
                  )}
                </div>
              )}

              <div className="form-grid">
                <label>Loja da atribuição *
                  <select value={form.store} onChange={(event) => setForm({ ...form, store: event.target.value })}>
                    <option value="">Selecione</option>{stores.filter((store) => store.status === 'Ativa').map((store) => <option key={store.id}>{store.name}</option>)}
                  </select>
                </label>
                <label>Turno da atribuição *
                  <select value={form.shift} onChange={(event) => setForm({ ...form, shift: event.target.value })}>
                    <option value="">Selecione</option><option>Manhã</option><option>Tarde</option><option>Noite</option><option>Comercial</option><option>Plantão</option>
                  </select>
                </label>
              </div>
              <label className="responsible-primary-option">
                <input type="checkbox" checked={form.isPrimary} onChange={(event) => setForm({ ...form, isPrimary: event.target.checked })} />
                <span>Responsável principal</span>
              </label>
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
