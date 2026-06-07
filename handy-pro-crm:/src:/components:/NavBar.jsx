import { supabase } from '../supabaseClient'

export default function NavBar({ activeTab, setActiveTab, userEmail }) {
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  return (
    <nav className="navbar">
      <span className="navbar-brand">🔧 Handy Pro</span>

      <button
        className={`nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
        onClick={() => setActiveTab('dashboard')}
      >
        Dashboard
      </button>
      <button
        className={`nav-tab ${activeTab === 'customers' ? 'active' : ''}`}
        onClick={() => setActiveTab('customers')}
      >
        Customers
      </button>
      <button
        className={`nav-tab ${activeTab === 'estimates' ? 'active' : ''}`}
        onClick={() => setActiveTab('estimates')}
      >
        Estimates
      </button>

      <div className="navbar-right">
        <span className="nav-user">{userEmail}</span>
        <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
      </div>
    </nav>
  )
}
