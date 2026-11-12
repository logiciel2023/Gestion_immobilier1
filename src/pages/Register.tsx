import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../styles/auth.css'

export default function Register() {
  const navigate = useNavigate()
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [contact, setContact] = useState('')
  const [email, setEmail] = useState('')
  const [mdp, setMdp] = useState('')
  const [vmdp, setVmdp] = useState('')
  const [errors, setErrors] = useState<{ email?: string; mdp?: string }>({})
  const [generalError, setGeneralError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    setErrors({})
    setGeneralError('')

    if (mdp !== vmdp) {
      setErrors({ mdp: 'Le mot de passe de confirmation est incorrect.' })
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password: mdp,
      options: {
        data: { nom, prenom, contact },
      },
    })

    if (error) {
      if (error.message.includes('already')) {
        setErrors({ email: 'Cet email existe déjà.' })
      } else {
        setGeneralError(error.message)
      }
      setLoading(false)
      return
    }

    if (data.user) {
      navigate('/accueil')
    }
  }

  return (
    <div className="register-page">
      <form onSubmit={handleRegister} className="register-form">
        <fieldset className="field-set">
          <div className="container">
            <legend><h2>Inscription</h2></legend>
            <div className="form-field">
              <label>Nom</label>
              <input
                type="text"
                placeholder="Votre nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Prénom</label>
              <input
                type="text"
                placeholder="Votre prénom"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Contact</label>
              <input
                type="text"
                placeholder="Votre contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="Votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="form-field">
              <label>Mot de passe</label>
              <input
                type="password"
                placeholder="Votre mot de passe"
                value={mdp}
                onChange={(e) => setMdp(e.target.value)}
                required
              />
            </div>
            <div className="form-field">
              <label>Vérification du mot de passe</label>
              <input
                type="password"
                placeholder="Confirmation du mot de passe"
                value={vmdp}
                onChange={(e) => setVmdp(e.target.value)}
                required
              />
              {errors.mdp && <span className="field-error">{errors.mdp}</span>}
            </div>
            {generalError && <div className="alert-error">{generalError}</div>}
            <button type="submit" disabled={loading}>
              {loading ? 'Inscription...' : 'Valider'}
            </button>
            <p className="login-back">
              Déjà inscrit ? <Link to="/" className="link">Se connecter</Link>
            </p>
          </div>
        </fieldset>
      </form>
    </div>
  )
}
