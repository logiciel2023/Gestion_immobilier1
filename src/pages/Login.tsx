import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/auth.css'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [mdp, setMdp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: mdp,
    })

    if (error) {
      setError('Email ou mot de passe invalide.')
      setLoading(false)
      return
    }

    // Check if account is active
    const { data: profile } = await supabase
      .from('profiles')
      .select('statut, role')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profile?.statut === 'inactif') {
      await supabase.auth.signOut()
      setError('Votre compte a été désactivé. Contactez un administrateur.')
      setLoading(false)
      return
    }

    if (profile?.role === 'admin') {
      navigate('/admin/dashboard')
    } else {
      navigate('/accueil')
    }
  }

  return (
    <div className="auth-page">
      <form onSubmit={handleLogin} className="auth-form">
        <h1>Se connecter</h1>
        <div className="social-media">
          <a href="#"><i className="fa-brands fa-google"></i></a>
          <a href="#"><i className="fa-brands fa-instagram"></i></a>
          <a href="#"><i className="fa-brands fa-facebook"></i></a>
          <a href="#"><i className="fa-brands fa-twitter"></i></a>
        </div>
        <p className="use-email">Ou utiliser mon adresse email:</p>
        {error && <div className="alert-error">{error}</div>}
        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={mdp}
            onChange={(e) => setMdp(e.target.value)}
            required
          />
        </div>
        <p className="register-link">
          Je n'ai pas de <span>compte</span>. Je m'en <Link to="/inscription" className="link">crée</Link> un.
        </p>
        <button type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
        <Link to="/admin" className="admin-access">
          <i className="fa-solid fa-user-shield"></i> Espace Administrateur
        </Link>
      </form>
    </div>
  )
}
