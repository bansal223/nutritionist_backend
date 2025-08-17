import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'patient':
          navigate('/patient/')
          break
        case 'nutritionist':
          navigate('/nutritionist/')
          break
        case 'admin':
          navigate('/admin/')
          break
        default:
          navigate('/login')
      }
    }
  }, [user, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Loading...</h1>
        <p className="text-gray-600">Redirecting to your dashboard</p>
      </div>
    </div>
  )
} 