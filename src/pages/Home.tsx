import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import '../styles/home.css'

export default function Home() {
  const { user, profile, loading, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && !user) {
      navigate('/')
    }
  }, [user, loading, navigate])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (loading) return <div className="loading">Chargement...</div>

  return (
    <div className="home-page">
      <div className="main">
        <div className="navbar">
          <div className="logo">
            <h3>ARCHI-TECH</h3>
          </div>
          <div className="menu">
            <ul>
              <li><Link to="/accueil">ACCUEIL</Link></li>
              <li><a href="#">ABOUT</a></li>
              <li><a href="#">APPARTEMENT</a></li>
              <li><a href="#">REPRESENTANT</a></li>
              <li><Link to="/clients">CLIENT</Link></li>
              {isAdmin && <li><Link to="/admin/dashboard">ADMIN</Link></li>}
              <li><a href="#">CONTACT</a></li>
            </ul>
          </div>
          <div className="search-box">
            <a href="#" onClick={(e) => { e.preventDefault(); handleSignOut() }}>
              <i className="fa-solid fa-right-to-bracket" style={{ fontSize: '28px', color: '#2563eb' }}></i>
              <div className="infobull">Déconnexion</div>
            </a>
          </div>
        </div>
      </div>
      <div className="welcome-section">
        <h1>Bienvenue, {profile?.prenom || profile?.nom || 'Utilisateur'} !</h1>
        <p>Vous êtes connecté à la plateforme de gestion immobilière ARCHI-TECH.</p>
        <div className="action-cards">
          <Link to="/clients" className="action-card">
            <i className="fa-solid fa-users"></i>
            <h3>Gérer les clients</h3>
            <p>Ajoutez et gérez vos clients et appartements</p>
          </Link>
          <div className="action-card">
            <i className="fa-solid fa-building"></i>
            <h3>Appartements</h3>
            <p>Consultez la liste des appartements disponibles</p>
          </div>
          {isAdmin && (
            <Link to="/admin/dashboard" className="action-card admin-card">
              <i className="fa-solid fa-user-shield"></i>
              <h3>Espace Admin</h3>
              <p>Gérez les comptes utilisateurs</p>
            </Link>
          )}
        </div>
      </div>
      <p className="contact-text">Contacter - nous</p>
      <div className="footer">
        <a href="https://www.facebook.com"><i className="fa-brands fa-facebook"></i></a>
        <a href="https://www.whatsapp.com"><i className="fa-brands fa-whatsapp"></i></a>
        <a href="https://www.twitter.com"><i className="fa-brands fa-twitter"></i></a>
        <a href="https://www.instagram.com"><i className="fa-brands fa-instagram"></i></a>
      </div>
    </div>
  )
}
