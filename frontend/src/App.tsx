import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import PatientDashboard from './pages/PatientDashboard'
import NutritionistDashboard from './pages/NutritionistDashboard'
import NutritionistPatients from './pages/NutritionistPatients'
import NutritionistMealPlans from './pages/NutritionistMealPlans'
import NutritionistProgress from './pages/NutritionistProgress'
import AdminDashboard from './pages/AdminDashboard'
import AdminAssignments from './pages/AdminAssignments'
import Layout from './components/Layout'

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

function AppRoutes() {
  const { user } = useAuth()
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />
      
      <Route path="/" element={
        <ProtectedRoute allowedRoles={['patient', 'nutritionist', 'admin']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        <Route path="patient/*" element={
          <ProtectedRoute allowedRoles={['patient']}>
            <PatientDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="nutritionist/*" element={
          <ProtectedRoute allowedRoles={['nutritionist']}>
            <Routes>
              <Route index element={<NutritionistDashboard />} />
              <Route path="patients" element={<NutritionistPatients />} />
              <Route path="meal-plans" element={<NutritionistMealPlans />} />
              <Route path="progress" element={<NutritionistProgress />} />
            </Routes>
          </ProtectedRoute>
        } />
        
        <Route path="admin/*" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Routes>
              <Route index element={<AdminDashboard />} />
              <Route path="assignments" element={<AdminAssignments />} />
            </Routes>
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App 