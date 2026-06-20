import { useMemo } from 'react'
import MetricCard, { type Metric } from '../components/cards/MetricCard'
import AppLayout from '../components/layout/AppLayout'
import { loadOccurrences, occurrenceDateValue } from '../services/occurrenceStorage'

export default function Dashboard() {
  const dashboard = useMemo(() => {
    const occurrences = loadOccurrences()
    const stores = new Set(occurrences.map((item) => item.store).filter(Boolean))
    const sectors = new Set(occurrences.map((item) => item.sector).filter(Boolean))
    const types = new Set(occurrences.flatMap((item) => item.types))
    const responsibles = new Set(occurrences.map((item) => item.responsible).filter(Boolean))
    const pending = occurrences.filter((item) =>
      ['Aberta', 'Em análise', 'Em andamento'].includes(item.status),
    )

    const metrics: Metric[] = [
      { title: 'Ocorrências registradas', value: occurrences.length, icon: '📝' },
      { title: 'Lojas envolvidas', value: stores.size, icon: '🏪' },
      { title: 'Setores envolvidos', value: sectors.size, icon: '🏷️' },
      { title: 'Responsáveis acionados', value: responsibles.size, icon: '👥' },
      { title: 'Tipos registrados', value: types.size, icon: '📋' },
      { title: 'Ocorrências pendentes', value: pending.length, icon: '⚠️' },
    ]

    const recent = [...occurrences]
      .sort((a, b) => occurrenceDateValue(b.date) - occurrenceDateValue(a.date))
      .slice(0, 5)

    const storeRanking = Array.from(
      occurrences.reduce((ranking, occurrence) => {
        ranking.set(occurrence.store, (ranking.get(occurrence.store) ?? 0) + 1)
        return ranking
      }, new Map<string, number>()),
      ([store, total]) => ({ store, total }),
    )
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)

    return { metrics, occurrences, recent, storeRanking }
  }, [])

  return (
    <AppLayout title="Dashboard">
      <div id="dashboard">
        <section className="welcome-box">
          <div>
            <h1>Dashboard</h1>
            <p>Bem-vindo, <strong>Gerente Matriz</strong>. Perfil: Administração.</p>
          </div>
          <span className="dashboard-scope">Dados do armazenamento local</span>
        </section>

        <section className="cards-grid" aria-label="Resumo da dashboard">
          {dashboard.metrics.map((metric) => <MetricCard metric={metric} key={metric.title} />)}
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-panel" id="ocorrencias">
            <div className="dashboard-panel-header">
              <h2>Ocorrências recentes</h2>
              <span>{dashboard.occurrences.length} no total</span>
            </div>

            {dashboard.recent.length ? (
              <div className="dashboard-list">
                {dashboard.recent.map((occurrence) => (
                  <div className="dashboard-list-item" key={occurrence.id}>
                    <div>
                      <strong>{occurrence.title}</strong>
                      <span>{occurrence.store} • {occurrence.sector} • {occurrence.status}</span>
                    </div>
                    <small>{occurrence.date}</small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dashboard-empty">Nenhuma ocorrência registrada.</p>
            )}
          </article>

          <article className="dashboard-panel" id="lojas">
            <div className="dashboard-panel-header">
              <h2>Lojas com mais registros</h2>
              <span>Top 5</span>
            </div>

            {dashboard.storeRanking.length ? (
              <div className="dashboard-ranking">
                {dashboard.storeRanking.map((item) => (
                  <div className="ranking-item" key={item.store}>
                    <div>
                      <strong>{item.store}</strong>
                      <span>{item.total} ocorrência(s)</span>
                    </div>
                    <div className="ranking-bar">
                      <span style={{ width: `${Math.max(12, (item.total / dashboard.storeRanking[0].total) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="dashboard-empty">Nenhuma loja com ocorrência.</p>
            )}
          </article>
        </section>
      </div>
    </AppLayout>
  )
}
