export interface Metric {
  title: string
  value: number
  icon: string
}

export default function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article className="stats-card">
      <div className="stats-card-icon">{metric.icon}</div>
      <div className="stats-card-info">
        <h3>{metric.value}</h3>
        <p>{metric.title}</p>
      </div>
    </article>
  )
}
