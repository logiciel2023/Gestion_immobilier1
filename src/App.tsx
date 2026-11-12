import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'
import Clients from './pages/Clients'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import type { JSX } from 'react'

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="loading">Chargement...</div>
  if (!user) return <Navigate to="/" replace />
  return children
}

function AdminRoute({ children }: { children: JSX.Element }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return <div className="loading">Chargement...</div>
  if (!user) return <Navigate to="/admin" replace />
  if (!isAdmin) return <Navigate to="/accueil" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
          <Route path="/accueil" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
