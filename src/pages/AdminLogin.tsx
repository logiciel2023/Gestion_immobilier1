import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/admin.css'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [mdp, setMdp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: mdp,
    })

    if (authError) {
      setError('Identifiants administrateur invalides.')
      setLoading(false)
      return
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, statut')
      .eq('id', data.user.id)
      .maybeSingle()

    if (!profile || profile.role !== 'admin') {
      await supabase.auth.signOut()
      setError('Accès refusé. Vous n\'êtes pas administrateur.')
      setLoading(false)
      return
    }

    if (profile.statut === 'inactif') {
      await supabase.auth.signOut()
      setError('Votre compte administrateur a été désactivé.')
      setLoading(false)
      return
    }

    navigate('/admin/dashboard')
  }

  return (
    <div className="login-wrapper">
      <form onSubmit={handleLogin} className="login-form">
        <div className="login-header">
          <i className="fa-solid fa-user-shield"></i>
          <h1>Espace Administrateur</h1>
          <p>Connectez-vous pour gérer les comptes</p>
        </div>
        {error && <div className="alert">{error}</div>}
        <div className="input-group">
          <i className="fa-solid fa-envelope"></i>
          <input
            type="email"
            placeholder="Email administrateur"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <i className="fa-solid fa-lock"></i>
          <input
            type="password"
            placeholder="Mot de passe"
            value={mdp}
            onChange={(e) => setMdp(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'} <i className="fa-solid fa-arrow-right"></i>
        </button>
        <Link to="/" className="back-link">
          <i className="fa-solid fa-arrow-left"></i> Retour au site
        </Link>
      </form>
    </div>
  )
}
