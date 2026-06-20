import appSoftLogo from '../../assets/logo-appsoft-orange.png'

export default function AppFooter() {
  return (
    <footer className="app-footer">
      <span>© {new Date().getFullYear()} Ocorrências BH</span>
      <a href="https://appsoft-lucio.github.io/appsoft-agency/" target="_blank" rel="noreferrer">
        <span>Desenvolvido por</span>
        <img src={appSoftLogo} alt="AppSoft" />
      </a>
    </footer>
  )
}
