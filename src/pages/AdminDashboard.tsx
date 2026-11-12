import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase, Profile } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import '../styles/admin.css'

export default function AdminDashboard() {
  const { user, profile, loading, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [users, setUsers] = useState<Profile[]>([])
  const [search, setSearch] = useState('')
  const [notif, setNotif] = useState('')
  const [editUser, setEditUser] = useState<Profile | null>(null)
  const [editNom, setEditNom] = useState('')
  const [editPrenom, setEditPrenom] = useState('')
  const [editContact, setEditContact] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [dataLoading, setDataLoading] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/admin')
        return
      }
      if (!isAdmin) {
        navigate('/admin')
        return
      }
      loadUsers()
    }
  }, [user, loading, isAdmin, navigate])

  async function loadUsers() {
    setDataLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erreur:', error)
    } else {
      setUsers(data as Profile[])
    }
    setDataLoading(false)
  }

  const filteredUsers = users.filter((u) => {
    if (!search) return true
    const t = search.toLowerCase()
    return (
      u.nom?.toLowerCase().includes(t) ||
      u.prenom?.toLowerCase().includes(t) ||
      u.contact?.toLowerCase().includes(t) ||
      (u as any).email?.toLowerCase().includes(t)
    )
  })

  const nbTotal = users.length
  const nbActifs = users.filter((u) => u.statut === 'actif').length
  const nbInactifs = users.filter((u) => u.statut === 'inactif').length

  async function handleToggleStatut(u: Profile) {
    const nouvelEtat = u.statut === 'actif' ? 'inactif' : 'actif'
    const { error } = await supabase
      .from('profiles')
      .update({ statut: nouvelEtat })
      .eq('id', u.id)

    if (error) {
      setNotif('Erreur lors du changement de statut.')
    } else {
      setNotif('Statut modifié avec succès.')
      loadUsers()
    }
    setTimeout(() => setNotif(''), 3000)
  }

  async function handleDelete(id: string) {
    if (!confirm('Voulez-vous vraiment supprimer cet utilisateur ? Cette action supprimera aussi son compte.')) return

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) {
      setNotif('Erreur lors de la suppression.')
    } else {
      setNotif('Utilisateur supprimé avec succès.')
      loadUsers()
    }
    setTimeout(() => setNotif(''), 3000)
  }

  function startEdit(u: Profile) {
    setEditUser(u)
    setEditNom(u.nom || '')
    setEditPrenom(u.prenom || '')
    setEditContact(u.contact || '')
    // email is in auth.users, not directly in profiles — we'll skip email editing
    setEditEmail('')
  }

  async function handleEditSave() {
    if (!editUser) return
    const { error } = await supabase
      .from('profiles')
      .update({ nom: editNom, prenom: editPrenom, contact: editContact })
      .eq('id', editUser.id)

    if (error) {
      setNotif('Erreur lors de la modification.')
    } else {
      setNotif('Utilisateur modifié avec succès.')
      setEditUser(null)
      loadUsers()
    }
    setTimeout(() => setNotif(''), 3000)
  }

  const handleAdminSignOut = async () => {
    await signOut()
    navigate('/admin')
  }

  if (loading) return <div className="loading">Chargement...</div>

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <i className="fa-solid fa-building"></i>
          <h2>ARCHI-TECH</h2>
          <span className="admin-badge">Admin</span>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="active"><i className="fa-solid fa-users"></i> <span>Utilisateurs</span></a>
          <Link to="/accueil"><i className="fa-solid fa-house"></i> <span>Voir le site</span></Link>
          <a href="#" onClick={(e) => { e.preventDefault(); handleAdminSignOut() }}>
            <i className="fa-solid fa-right-to-bracket"></i> <span>Déconnexion</span>
          </a>
        </nav>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <div>
            <h1>Gestion des comptes</h1>
            <p>Liste des clients inscrits sur la plateforme</p>
          </div>
          <div className="admin-info">
            <i className="fa-solid fa-user-shield"></i>
            <span>{profile?.prenom || profile?.nom || 'Admin'}</span>
          </div>
        </header>

        {notif && (
          <div className="notif">
            {notif}
            <i className="fa-solid fa-circle-check"></i>
          </div>
        )}

        <div className="stats">
          <div className="stat-card total">
            <i className="fa-solid fa-users"></i>
            <div>
              <span className="num">{nbTotal}</span>
              <span className="label">Total inscrits</span>
            </div>
          </div>
          <div className="stat-card actif">
            <i className="fa-solid fa-circle-check"></i>
            <div>
              <span className="num">{nbActifs}</span>
              <span className="label">Comptes actifs</span>
            </div>
          </div>
          <div className="stat-card inactif">
            <i className="fa-solid fa-circle-xmark"></i>
            <div>
              <span className="num">{nbInactifs}</span>
              <span className="label">Comptes désactivés</span>
            </div>
          </div>
        </div>

        <div className="toolbar">
          <div className="search-form">
            <div className="search-bar">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input
                type="text"
                placeholder="Rechercher par nom, email, contact..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {search && (
              <button className="btn-reset" onClick={() => setSearch('')}>
                <i className="fa-solid fa-rotate-left"></i> Réinitialiser
              </button>
            )}
          </div>
        </div>

        <div className="table-wrapper">
          {dataLoading ? (
            <p className="empty">Chargement des utilisateurs...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="empty">Aucun utilisateur trouvé.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Contact</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Inscrit le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} className={u.statut === 'inactif' ? 'row-inactif' : ''}>
                    <td>{u.nom || '-'}</td>
                    <td>{u.prenom || '-'}</td>
                    <td>{u.contact || '-'}</td>
                    <td>
                      {u.role === 'admin' ? (
                        <span className="badge badge-admin">Admin</span>
                      ) : (
                        <span className="badge badge-user">Utilisateur</span>
                      )}
                    </td>
                    <td>
                      {u.statut === 'actif' ? (
                        <span className="badge badge-actif">Actif</span>
                      ) : (
                        <span className="badge badge-inactif">Désactivé</span>
                      )}
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="actions">
                      <button className="btn-action btn-edit" title="Modifier" onClick={() => startEdit(u)}>
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        className="btn-action btn-toggle"
                        title={u.statut === 'actif' ? 'Désactiver' : 'Activer'}
                        onClick={() => handleToggleStatut(u)}
                        disabled={u.role === 'admin'}
                      >
                        <i className={`fa-solid ${u.statut === 'actif' ? 'fa-circle-xmark' : 'fa-circle-check'}`}></i>
                      </button>
                      <button
                        className="btn-action btn-delete"
                        title="Supprimer"
                        onClick={() => handleDelete(u.id)}
                        disabled={u.role === 'admin'}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {editUser && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditUser(null) }}>
          <div className="modal">
            <div className="modal-header">
              <h2><i className="fa-solid fa-pen"></i> Modifier l'utilisateur</h2>
              <button className="modal-close" onClick={() => setEditUser(null)}>
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="modal-form">
              <div className="form-row">
                <label>Nom</label>
                <input type="text" value={editNom} onChange={(e) => setEditNom(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Prénom</label>
                <input type="text" value={editPrenom} onChange={(e) => setEditPrenom(e.target.value)} />
              </div>
              <div className="form-row">
                <label>Contact</label>
                <input type="text" value={editContact} onChange={(e) => setEditContact(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setEditUser(null)}>Annuler</button>
                <button className="btn-save" onClick={handleEditSave}>
                  <i className="fa-solid fa-check"></i> Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
