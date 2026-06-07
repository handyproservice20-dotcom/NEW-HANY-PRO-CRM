import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './components/Login'
import NavBar from './components/NavBar'
import Dashboard from './components/Dashboard'
import Customers from './components/Customers'
import Estimates from './components/Estimates'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading...
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  return (
    <>
      <NavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={session.user.email}
      />
      <main className="main-content">
        {activeTab === 'dashboard'  && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === 'customers'  && <Customers />}
        {activeTab === 'estimates'  && <Estimates />}
      </main>
    </>
  )
}
