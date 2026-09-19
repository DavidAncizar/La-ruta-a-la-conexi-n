import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

// Páginas públicas
import LandingPage    from '@/pages/LandingPage'
import LoginPage      from '@/pages/auth/LoginPage'
import RegisterPage   from '@/pages/auth/RegisterPage'
import NotFoundPage   from '@/pages/NotFoundPage'
import AvatarDebug    from '@/pages/AvatarDebug'
import EscudoDebug    from '@/pages/EscudoDebug'

// Páginas protegidas
import DashboardPage    from '@/pages/dashboard/DashboardPage'
import WorldsPage       from '@/pages/worlds/WorldsPage'
import WorldDetailPage  from '@/pages/worlds/WorldDetailPage'
import GamePage         from '@/pages/game/GamePage'
import ProfilePage      from '@/pages/profile/ProfilePage'
import RankingPage      from '@/pages/ranking/RankingPage'
import AdminPage        from '@/pages/admin/AdminPage'

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Públicas ── */}
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/register"  element={<RegisterPage />} />

        {/* ── Protegidas (cualquier usuario autenticado) ── */}
        <Route path="/dashboard" element={
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/worlds" element={
          <ProtectedRoute><WorldsPage /></ProtectedRoute>
        } />
        <Route path="/worlds/:worldId" element={
          <ProtectedRoute><WorldDetailPage /></ProtectedRoute>
        } />
        <Route path="/game/:activityId" element={
          <ProtectedRoute><GamePage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/ranking" element={
          <ProtectedRoute><RankingPage /></ProtectedRoute>
        } />

        {/* ── Solo admin ── */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin"><AdminPage /></ProtectedRoute>
        } />

        {/* ── Debug (temporal) ── */}
        <Route path="/avatar-debug" element={<AvatarDebug />} />
        <Route path="/escudo-debug" element={<EscudoDebug />} />

        {/* ── 404 ── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
