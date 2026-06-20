import appSoftLogo from '../../assets/logo-appsoft-orange.png'

export default function AuthFooter() {
  return (
    <footer className="auth-footer">
      <span>Desenvolvido por</span>
      <a href="https://appsoft-lucio.github.io/appsoft-agency/" target="_blank" rel="noreferrer">
        <img src={appSoftLogo} alt="AppSoft" />
      </a>
    </footer>
  )
}
