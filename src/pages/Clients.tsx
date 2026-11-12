import { useState, useEffect, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, Client } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import '../styles/clients.css'

export default function Clients() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [clients, setClients] = useState<Client[]>([])
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [contact, setContact] = useState('')
  const [numapp, setNumapp] = useState('')
  const [message, setMessage] = useState('')
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    if (!loading && !user) navigate('/')
  }, [user, loading, navigate])

  useEffect(() => {
    if (user) loadClients()
  }, [user])

  async function loadClients() {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      setLoadError(true)
    } else {
      setClients(data as Client[])
    }
  }

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    if (!nom || !prenom || !contact || !numapp) {
      setMessage('Veuillez remplir tous les champs.')
      return
    }

    const { error } = await supabase
      .from('clients')
      .insert({ nom, prenom, contact, numapp: parseInt(numapp) })

    if (error) {
      setMessage('Erreur lors de l\'ajout du client.')
    } else {
      setMessage('Client ajouté avec succès !')
      setNom('')
      setPrenom('')
      setContact('')
      setNumapp('')
      loadClients()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce client ?')) return
    const { error } = await supabase.from('clients').delete().eq('id', id)
    if (!error) loadClients()
  }

  if (loading) return <div className="loading">Chargement...</div>

  return (
    <div className="clients-page">
      <nav className="clients-nav">
        <div className="nav-logo"><h3>ARCHI-TECH</h3></div>
        <ul>
          <li><Link to="/accueil">ACCUEIL</Link></li>
          <li><Link to="/clients"><strong>CLIENT</strong></Link></li>
          <li><Link to="/" onClick={(e) => { e.preventDefault(); supabase.auth.signOut(); navigate('/') }}>DÉCONNEXION</Link></li>
        </ul>
      </nav>

      <div className="clients-container">
        <div className="add-client-card">
          <h2><i className="fa-solid fa-user-plus"></i> Ajouter un client</h2>
          {message && <div className={message.includes('succès') ? 'alert-success' : 'alert-error'}>{message}</div>}
          <form onSubmit={handleAdd} className="client-form">
            <div className="form-field">
              <label>Nom</label>
              <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Prénom</label>
              <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Contact</label>
              <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} />
            </div>
            <div className="form-field">
              <label>Numéro appartement</label>
              <input type="number" value={numapp} onChange={(e) => setNumapp(e.target.value)} />
            </div>
            <button type="submit"><i className="fa-solid fa-check"></i> Valider</button>
          </form>
        </div>

        <div className="clients-list-card">
          <h2><i className="fa-solid fa-list"></i> Liste des clients</h2>
          {loadError ? (
            <p className="empty">Erreur lors du chargement des clients.</p>
          ) : clients.length === 0 ? (
            <p className="empty">Aucun client enregistré pour le moment.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Contact</th>
                    <th>N° Appart.</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id}>
                      <td>{c.nom}</td>
                      <td>{c.prenom}</td>
                      <td>{c.contact}</td>
                      <td>{c.numapp ?? '-'}</td>
                      <td>
                        <button className="btn-delete" onClick={() => handleDelete(c.id)}>
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
