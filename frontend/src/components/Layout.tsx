import React from 'react'
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
          { name: 'My Profile', href: '/nutritionist/profile', icon: User },
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
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                NutriCare
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700 font-medium">
                  {user?.role === 'patient' ? 'Patient' : user?.role === 'nutritionist' ? 'Nutritionist' : 'Admin'}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-red-600 transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
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
        <aside className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen">
          <nav className="mt-8">
            <div className="px-4 space-y-1">
              {getNavigationItems().map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-gray-700 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200 group"
                  >
                    <Icon size={20} className="group-hover:text-blue-600 transition-colors" />
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