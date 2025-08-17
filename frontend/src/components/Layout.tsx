import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LogOut, User, Calendar, BarChart3, Settings } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getNavigationItems = () => {
    if (!user) return []

    switch (user.role) {
      case 'patient':
        return [
          { name: 'Dashboard', href: '/patient/', icon: BarChart3 },
          { name: 'My Profile', href: '/patient/profile', icon: User },
          { name: 'Meal Plans', href: '/patient/meal-plans', icon: Calendar },
          { name: 'Progress', href: '/patient/progress', icon: BarChart3 },
        ]
      case 'nutritionist':
        return [
          { name: 'Dashboard', href: '/nutritionist/', icon: BarChart3 },
          { name: 'My Patients', href: '/nutritionist/patients', icon: User },
          { name: 'Meal Plans', href: '/nutritionist/meal-plans', icon: Calendar },
          { name: 'Progress Reports', href: '/nutritionist/progress', icon: BarChart3 },
        ]
      case 'admin':
        return [
          { name: 'Dashboard', href: '/admin/', icon: BarChart3 },
          { name: 'Users', href: '/admin/users', icon: User },
          { name: 'Nutritionists', href: '/admin/nutritionists', icon: User },
          { name: 'Assignments', href: '/admin/assignments', icon: User },
          { name: 'Metrics', href: '/admin/metrics', icon: BarChart3 },
        ]
      default:
        return []
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Nutritionist Platform
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              {getNavigationItems().map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
} 