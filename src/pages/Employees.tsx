import { useMemo, useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import {
  applyHrSync,
  fetchEmployeesFromHr,
  loadEmployees,
  loadLastHrSync,
  type Employee,
  type HrSyncResult,
} from '../services/employeeStorage'

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>(loadEmployees)
  const [lastSync, setLastSync] = useState(loadLastHrSync)
  const [syncPreview, setSyncPreview] = useState<HrSyncResult | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [search, setSearch] = useState('')
  const [storeFilter, setStoreFilter] = useState('Todas')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [message, setMessage] = useState('')

  const stores = useMemo(
    () => Array.from(new Set(employees.map((employee) => employee.store))).sort(),
    [employees],
  )

  const filteredEmployees = useMemo(() => {
    const term = search.toLocaleLowerCase('pt-BR').trim()
    return employees.filter((employee) => {
      const matchesSearch = !term || [
        employee.name,
        employee.registration,
        employee.role,
        employee.sector,
      ].some((value) => value.toLocaleLowerCase('pt-BR').includes(term))
      const matchesStore = storeFilter === 'Todas' || employee.store === storeFilter
      const matchesStatus = statusFilter === 'Todos' || employee.status === statusFilter
      return matchesSearch && matchesStore && matchesStatus
    })
  }, [employees, search, statusFilter, storeFilter])

  const summary = useMemo(() => ({
    total: employees.length,
    active: employees.filter((employee) => employee.status === 'Ativo').length,
    away: employees.filter((employee) => employee.status === 'Afastado').length,
    stores: new Set(employees.map((employee) => employee.store)).size,
  }), [employees])

  async function startHrSync() {
    setSyncing(true)
    setMessage('')
    try {
      setSyncPreview(await fetchEmployeesFromHr(employees))
    } catch {
      setMessage('Não foi possível conectar ao sistema de RH.')
    } finally {
      setSyncing(false)
    }
  }

  function confirmHrSync() {
    if (!syncPreview) return
    const synchronizedEmployees = applyHrSync(employees, syncPreview)
    setEmployees(synchronizedEmployees)
    setLastSync(syncPreview.receivedAt)
    setSyncPreview(null)
    setMessage(`${synchronizedEmployees.length} colaboradores sincronizados com sucesso.`)
  }

  return (
    <AppLayout title="Colaboradores">
      {message && (
        <div className="notification-overlay" role="presentation" onClick={() => setMessage('')}>
          <div className="page-notification" role="alertdialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <span className="notification-icon" aria-hidden="true">✓</span>
            <p>{message}</p>
            <button type="button" onClick={() => setMessage('')}>Entendi</button>
          </div>
        </div>
      )}

      <section className="hr-integration-card">
        <div className="hr-integration-icon" aria-hidden="true">RH</div>
        <div>
          <span className="integration-status"><i /> Integração simulada disponível</span>
          <h2>Sistema de RH Corporativo</h2>
          <p>Importe colaboradores e atualize automaticamente loja, setor, função, turno e situação cadastral.</p>
          <small>Última sincronização: {lastSync || 'Ainda não realizada'}</small>
        </div>
        <button type="button" onClick={startHrSync} disabled={syncing}>
          {syncing ? 'Conectando ao RH...' : 'Sincronizar agora'}
        </button>
      </section>

      <section className="employee-summary">
        <article><span>👥</span><div><strong>{summary.total}</strong><p>Colaboradores</p></div></article>
        <article><span>✅</span><div><strong>{summary.active}</strong><p>Ativos</p></div></article>
        <article><span>🩺</span><div><strong>{summary.away}</strong><p>Afastados</p></div></article>
        <article><span>🏪</span><div><strong>{summary.stores}</strong><p>Lojas integradas</p></div></article>
      </section>

      <section className="employee-list-card">
        <div className="employee-list-header">
          <div><h2>Colaboradores sincronizados</h2><p>Os dados abaixo são fornecidos pelo RH.</p></div>
          <span>{filteredEmployees.length} registro(s)</span>
        </div>
        <div className="employee-filters">
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar nome, matrícula, função ou setor..." />
          <select value={storeFilter} onChange={(event) => setStoreFilter(event.target.value)}>
            <option>Todas</option>
            {stores.map((store) => <option key={store}>{store}</option>)}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option>Todos</option><option>Ativo</option><option>Afastado</option><option>Inativo</option>
          </select>
        </div>

        {filteredEmployees.length ? (
          <div className="employee-table-wrap">
            <table className="employee-table">
              <thead><tr><th>COLABORADOR</th><th>LOJA / SETOR</th><th>FUNÇÃO</th><th>TURNO</th><th>ARMÁRIO</th><th>STATUS</th></tr></thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.registration}>
                    <td><strong>{employee.name}</strong><small>{employee.registration} • {employee.phone}</small></td>
                    <td><strong>{employee.store}</strong><small>{employee.sector}</small></td>
                    <td>{employee.role}</td><td>{employee.shift}</td><td>{employee.lockerNumber || '—'}</td>
                    <td><span className={`employee-status ${employee.status.toLowerCase()}`}>{employee.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="employee-empty"><span>⇄</span><h3>Nenhum colaborador sincronizado</h3><p>Clique em “Sincronizar agora” para simular a importação do RH.</p></div>
        )}
      </section>

      {syncPreview && (
        <div className="store-modal-overlay">
          <section className="store-modal hr-preview-modal" role="dialog" aria-modal="true" aria-label="Prévia da sincronização">
            <div className="store-modal-header">
              <div><h2>Prévia da sincronização</h2><p>{syncPreview.source} • {syncPreview.receivedAt}</p></div>
              <button type="button" onClick={() => setSyncPreview(null)} aria-label="Fechar">×</button>
            </div>
            <div className="sync-summary">
              <span><strong>{syncPreview.items.filter((item) => item.syncAction === 'Novo').length}</strong> novos</span>
              <span><strong>{syncPreview.items.filter((item) => item.syncAction === 'Atualização').length}</strong> atualizações</span>
              <span><strong>{syncPreview.items.length}</strong> recebidos</span>
            </div>
            <div className="sync-preview-list">
              {syncPreview.items.map((item) => (
                <div key={item.registration}>
                  <span className={`sync-action ${item.syncAction === 'Novo' ? 'new' : 'update'}`}>{item.syncAction}</span>
                  <div><strong>{item.name}</strong><small>{item.registration} • {item.store} • {item.role}</small></div>
                </div>
              ))}
            </div>
            <div className="store-modal-actions">
              <button type="button" onClick={() => setSyncPreview(null)}>Cancelar</button>
              <button className="primary-button" type="button" onClick={confirmHrSync}>Confirmar sincronização</button>
            </div>
          </section>
        </div>
      )}
    </AppLayout>
  )
}
