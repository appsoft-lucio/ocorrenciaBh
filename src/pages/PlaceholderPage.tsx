import AppLayout from '../components/layout/AppLayout'

interface PlaceholderPageProps {
  title: string
  description: string
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <AppLayout title={title}>
      <section className="welcome-box">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <span className="dashboard-scope">Em preparação</span>
      </section>

      <section className="empty-page">
        <span>🚧</span>
        <h2>Página preparada</h2>
        <p>Os campos e funcionalidades serão adicionados quando você passar as regras deste módulo.</p>
      </section>
    </AppLayout>
  )
}
