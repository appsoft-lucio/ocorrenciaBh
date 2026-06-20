import { useMemo, useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { occurrenceCategories } from '../data/occurrenceCategories'
import { loadOccurrences, occurrenceDateValue, type StoredOccurrence } from '../services/occurrenceStorage'
import { loadStores } from '../services/storeStorage'

const statuses = ['Todos', 'Aberta', 'Em análise', 'Em andamento', 'Resolvida', 'Cancelada']
const priorities = ['Todas', 'Baixa', 'Média', 'Alta', 'Crítica']

function dateToInputValue(date: string) {
  const timestamp = occurrenceDateValue(date)
  if (!timestamp) return ''
  const parsed = new Date(timestamp)
  return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`
}

function escapeCsv(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`
}

export default function Reports() {
  const occurrences = useMemo(() => loadOccurrences(), [])
  const stores = useMemo(() => loadStores(), [])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [storeFilter, setStoreFilter] = useState('Todas')
  const [categoryFilter, setCategoryFilter] = useState('Todas')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [priorityFilter, setPriorityFilter] = useState('Todas')

  const filtered = useMemo(() => occurrences.filter((occurrence) => {
    const occurrenceDate = dateToInputValue(occurrence.date)
    return (
      (!startDate || occurrenceDate >= startDate) &&
      (!endDate || occurrenceDate <= endDate) &&
      (storeFilter === 'Todas' || occurrence.store === storeFilter) &&
      (categoryFilter === 'Todas' || occurrence.category === categoryFilter) &&
      (statusFilter === 'Todos' || occurrence.status === statusFilter) &&
      (priorityFilter === 'Todas' || occurrence.priority === priorityFilter)
    )
  }), [categoryFilter, endDate, occurrences, priorityFilter, startDate, statusFilter, storeFilter])

  const report = useMemo(() => {
    const resolved = filtered.filter((item) => item.status === 'Resolvida').length
    const pending = filtered.filter((item) => ['Aberta', 'Em análise', 'Em andamento'].includes(item.status)).length
    const critical = filtered.filter((item) => item.priority === 'Crítica').length
    const resolutionRate = filtered.length ? Math.round((resolved / filtered.length) * 100) : 0

    const byCategory = occurrenceCategories.map((category) => ({
      label: category.name,
      total: filtered.filter((item) => item.category === category.name).length,
    })).filter((item) => item.total > 0).sort((a, b) => b.total - a.total)

    const byStatus = statuses.slice(1).map((status) => ({
      label: status,
      total: filtered.filter((item) => item.status === status).length,
    })).filter((item) => item.total > 0)

    const storeRanking = Array.from(
      filtered.reduce((ranking, occurrence) => {
        ranking.set(occurrence.store, (ranking.get(occurrence.store) ?? 0) + 1)
        return ranking
      }, new Map<string, number>()),
      ([store, total]) => ({ store, total }),
    ).sort((a, b) => b.total - a.total)

    return { resolved, pending, critical, resolutionRate, byCategory, byStatus, storeRanking }
  }, [filtered])

  function clearFilters() {
    setStartDate('')
    setEndDate('')
    setStoreFilter('Todas')
    setCategoryFilter('Todas')
    setStatusFilter('Todos')
    setPriorityFilter('Todas')
  }

  function exportCsv(items: StoredOccurrence[]) {
    const header = ['Protocolo', 'Data', 'Loja', 'Setor', 'Categoria', 'Ocorrência', 'Gravidade', 'Responsável', 'Status', 'Descrição']
    const rows = items.map((item) => [
      item.id, item.date, item.store, item.sector, item.category, item.title,
      item.priority, item.responsible, item.status, item.description,
    ])
    const content = '\uFEFF' + [header, ...rows].map((row) => row.map(escapeCsv).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-ocorrencias-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const maxCategory = report.byCategory[0]?.total || 1
  const maxStore = report.storeRanking[0]?.total || 1

  return (
    <AppLayout title="Relatórios">
      <section className="report-header">
        <div><h2>Relatório de ocorrências</h2><p>Analise os registros operacionais e exporte os dados para o Excel.</p></div>
        <button type="button" onClick={() => exportCsv(filtered)} disabled={!filtered.length}>⬇ Exportar CSV</button>
      </section>

      <section className="report-filters">
        <label>Data inicial<input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
        <label>Data final<input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} /></label>
        <label>Loja<select value={storeFilter} onChange={(event) => setStoreFilter(event.target.value)}><option>Todas</option>{stores.map((store) => <option key={store.id}>{store.name}</option>)}</select></label>
        <label>Categoria<select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option>Todas</option>{occurrenceCategories.map((category) => <option key={category.name}>{category.name}</option>)}</select></label>
        <label>Status<select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
        <label>Gravidade<select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>{priorities.map((priority) => <option key={priority}>{priority}</option>)}</select></label>
        <button type="button" onClick={clearFilters}>Limpar filtros</button>
      </section>

      <section className="report-summary">
        <article><span>📝</span><div><strong>{filtered.length}</strong><p>Total filtrado</p></div></article>
        <article><span>⏳</span><div><strong>{report.pending}</strong><p>Pendentes</p></div></article>
        <article><span>✅</span><div><strong>{report.resolved}</strong><p>Resolvidas</p></div></article>
        <article><span>🚨</span><div><strong>{report.critical}</strong><p>Críticas</p></div></article>
        <article><span>📈</span><div><strong>{report.resolutionRate}%</strong><p>Taxa de resolução</p></div></article>
      </section>

      <section className="report-grid">
        <article className="report-panel">
          <div className="report-panel-title"><h3>Ocorrências por categoria</h3><span>{report.byCategory.length} categorias</span></div>
          <div className="report-bars">
            {report.byCategory.map((item) => (
              <div key={item.label}><div><strong>{item.label}</strong><span>{item.total}</span></div><i><b style={{ width: `${(item.total / maxCategory) * 100}%` }} /></i></div>
            ))}
            {!report.byCategory.length && <p className="dashboard-empty">Nenhum dado para os filtros selecionados.</p>}
          </div>
        </article>

        <article className="report-panel">
          <div className="report-panel-title"><h3>Distribuição por status</h3><span>{filtered.length} registros</span></div>
          <div className="status-distribution">
            {report.byStatus.map((item) => (
              <div key={item.label}><span className={`report-status-dot dot-${item.label.toLowerCase().replace(' ', '-')}`} /><strong>{item.label}</strong><b>{item.total}</b><small>{filtered.length ? Math.round((item.total / filtered.length) * 100) : 0}%</small></div>
            ))}
            {!report.byStatus.length && <p className="dashboard-empty">Nenhum status encontrado.</p>}
          </div>
        </article>
      </section>

      <section className="report-grid">
        <article className="report-panel">
          <div className="report-panel-title"><h3>Ranking de lojas</h3><span>Por quantidade</span></div>
          <div className="report-ranking">
            {report.storeRanking.map((item, index) => (
              <div key={item.store}><span>{index + 1}º</span><div><strong>{item.store}</strong><i><b style={{ width: `${(item.total / maxStore) * 100}%` }} /></i></div><strong>{item.total}</strong></div>
            ))}
            {!report.storeRanking.length && <p className="dashboard-empty">Nenhuma loja encontrada.</p>}
          </div>
        </article>

        <article className="report-panel">
          <div className="report-panel-title"><h3>Gravidade crítica e alta</h3><span>Atenção prioritária</span></div>
          <div className="critical-list">
            {filtered.filter((item) => ['Crítica', 'Alta'].includes(item.priority)).slice(0, 6).map((item) => (
              <div key={item.id}><div><strong>{item.title}</strong><span>{item.store} • {item.sector}</span></div><small className={item.priority.toLowerCase()}>{item.priority}</small></div>
            ))}
            {!filtered.some((item) => ['Crítica', 'Alta'].includes(item.priority)) && <p className="dashboard-empty">Nenhuma ocorrência prioritária.</p>}
          </div>
        </article>
      </section>

      <section className="report-table-card">
        <div className="report-panel-title"><h3>Detalhamento das ocorrências</h3><span>{filtered.length} registros</span></div>
        <div className="employee-table-wrap">
          <table className="report-table">
            <thead><tr><th>PROTOCOLO</th><th>DATA</th><th>LOJA / SETOR</th><th>CATEGORIA</th><th>GRAVIDADE</th><th>STATUS</th></tr></thead>
            <tbody>{filtered.map((item) => <tr key={item.id}><td><strong>#{item.id}</strong><small>{item.title}</small></td><td>{item.date}</td><td><strong>{item.store}</strong><small>{item.sector}</small></td><td>{item.category}</td><td><span className={`report-priority ${item.priority.toLowerCase()}`}>{item.priority}</span></td><td>{item.status}</td></tr>)}</tbody>
          </table>
        </div>
        {!filtered.length && <p className="dashboard-empty">Nenhuma ocorrência encontrada.</p>}
      </section>
    </AppLayout>
  )
}
