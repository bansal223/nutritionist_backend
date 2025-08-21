import React, { useEffect, useState } from 'react'
import { patientsApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  MessageCircle, 
  Award,
  Activity,
  Heart,
  Scale,
  Users,
  Bell,
  Plus
} from 'lucide-react'

interface DashboardStats {
  currentWeight: number
  startWeight: number
  weightChange: number
  weeklyProgress: number
  mealPlanAdherence: number
  daysOnPlan: number
  nextCheckIn: string
  unreadMessages: number
  achievements: number
}

interface QuickAction {
  title: string
  description: string
  icon: React.ComponentType<any>
  action: () => void
  color: string
}

export default function PatientDashboard() {
  const { user } = useAuth()
  const [mealPlan, setMealPlan] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [progressReports, setProgressReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    currentWeight: 0,
    startWeight: 0,
    weightChange: 0,
    weeklyProgress: 0,
    mealPlanAdherence: 0,
    daysOnPlan: 0,
    nextCheckIn: '',
    unreadMessages: 0,
    achievements: 0
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch all data in parallel
        const [mealPlanData, profileData, progressData] = await Promise.allSettled([
          patientsApi.getCurrentMealPlan(),
          patientsApi.getProfile(),
          patientsApi.getProgressReports(5)
        ])

        if (mealPlanData.status === 'fulfilled') {
          setMealPlan(mealPlanData.value)
        }

        if (profileData.status === 'fulfilled') {
          setProfile(profileData.value)
        }

        if (progressData.status === 'fulfilled') {
          setProgressReports(progressData.value || [])
        }

        // Calculate dashboard stats
        const profileValue = profileData.status === 'fulfilled' ? profileData.value : null
        const progressValue = progressData.status === 'fulfilled' ? progressData.value : null
        calculateDashboardStats(profileValue, progressValue)
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const calculateDashboardStats = (profileData: any, progressData: any) => {
    if (!profileData || !progressData || progressData.length === 0) return

    const latestProgress = progressData[0]
    const startWeight = profileData.start_weight_kg || 0
    const currentWeight = latestProgress.weight_kg || 0
    const weightChange = currentWeight - startWeight

    setStats({
      currentWeight,
      startWeight,
      weightChange,
      weeklyProgress: latestProgress.adherence_pct || 0,
      mealPlanAdherence: latestProgress.adherence_pct || 0,
      daysOnPlan: progressData.length * 7,
      nextCheckIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      unreadMessages: 0, // TODO: Implement messaging
      achievements: Math.floor(progressData.length / 2) // Simple achievement calculation
    })
  }

  const quickActions: QuickAction[] = [
    {
      title: 'Log Progress',
      description: 'Update your weight and measurements',
      icon: Plus,
      action: () => window.location.href = '/patient/progress',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'View Meal Plan',
      description: 'Check your current meal plan',
      icon: Calendar,
      action: () => window.location.href = '/patient/meal-plans',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Message Nutritionist',
      description: 'Get in touch with your nutritionist',
      icon: MessageCircle,
      action: () => alert('Messaging feature coming soon!'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Update Profile',
      description: 'Modify your health information',
      icon: Users,
      action: () => window.location.href = '/patient/profile',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, color }: any) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-3">
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(trend)}% from last week
          </span>
        </div>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading your dashboard...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.first_name || 'Patient'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your nutrition journey overview
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {stats.unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {stats.unreadMessages}
              </span>
            )}
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {profile?.first_name?.charAt(0) || 'P'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Current Weight"
          value={`${stats.currentWeight} kg`}
          subtitle={`${stats.weightChange > 0 ? '+' : ''}${stats.weightChange.toFixed(1)} kg change`}
          icon={Scale}
          trend={stats.weightChange}
          color="bg-blue-500"
        />
        <StatCard
          title="Weekly Progress"
          value={`${stats.weeklyProgress}%`}
          subtitle="Meal plan adherence"
          icon={Target}
          trend={stats.weeklyProgress - 85}
          color="bg-green-500"
        />
        <StatCard
          title="Days on Plan"
          value={stats.daysOnPlan}
          subtitle="Consistent tracking"
          icon={Activity}
          color="bg-purple-500"
        />
        <StatCard
          title="Achievements"
          value={stats.achievements}
          subtitle="Milestones reached"
          icon={Award}
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white p-4 rounded-xl text-left transition-all duration-200 hover:scale-105 hover:shadow-lg`}
              >
                <Icon className="w-8 h-8 mb-3" />
                <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                <p className="text-blue-100 text-sm">{action.description}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent Progress & Meal Plan Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Progress</h2>
          {progressReports.length > 0 ? (
            <div className="space-y-4">
              {progressReports.slice(0, 3).map((report: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Week of {new Date(report.week_start).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Weight: {report.weight_kg}kg | Adherence: {report.adherence_pct}%
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-medium ${
                      report.adherence_pct >= 80 ? 'text-green-600' : 
                      report.adherence_pct >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {report.adherence_pct >= 80 ? 'Excellent' : 
                       report.adherence_pct >= 60 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No progress reports yet</p>
              <button 
                onClick={() => window.location.href = '/patient/progress'}
                className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
              >
                Log your first progress
              </button>
            </div>
          )}
        </div>

        {/* Meal Plan Preview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Meal Plan</h2>
          {mealPlan ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Week of {new Date(mealPlan.week_start).toLocaleDateString()}
                </p>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  Active
                </span>
              </div>
              {mealPlan.days && mealPlan.days.slice(0, 2).map((day: any, index: number) => (
                <div key={index} className="mb-3 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{day.day_name}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Breakfast:</span> {day.breakfast}</p>
                    <p><span className="font-medium">Lunch:</span> {day.lunch}</p>
                    <p><span className="font-medium">Dinner:</span> {day.dinner}</p>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => window.location.href = '/patient/meal-plans'}
                className="w-full mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                View full meal plan →
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No meal plan assigned yet</p>
              <p className="text-sm text-gray-500 mt-1">
                Your nutritionist will create a personalized meal plan for you
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">1</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Log your progress</p>
              <p className="text-sm text-gray-600">Update weight and measurements</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Follow meal plan</p>
              <p className="text-sm text-gray-600">Stick to your nutrition goals</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">Check in weekly</p>
              <p className="text-sm text-gray-600">Next check-in: {stats.nextCheckIn}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 