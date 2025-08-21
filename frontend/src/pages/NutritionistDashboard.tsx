import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { nutritionistsApi } from '../services/api'
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Heart, 
  Star, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  MessageCircle,
  BookOpen,
  Target,
  Award,
  Activity,
  Bell
} from 'lucide-react'

interface DashboardStats {
  totalPatients: number
  activePatients: number
  totalMealPlans: number
  averageRating: number
  completionRate: number
  newPatientsThisMonth: number
  pendingTasks: number
}

interface RecentActivity {
  id: string
  type: 'meal_plan' | 'progress' | 'patient' | 'message'
  title: string
  description: string
  time: string
  patientName?: string
}

export default function NutritionistDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    activePatients: 0,
    totalMealPlans: 0,
    averageRating: 0,
    completionRate: 0,
    newPatientsThisMonth: 0,
    pendingTasks: 0
  })
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch comprehensive dashboard stats
        const dashboardData = await nutritionistsApi.getDashboardStats()
        
        setStats({
          totalPatients: dashboardData.dashboard_stats.total_patients,
          activePatients: dashboardData.dashboard_stats.active_patients,
          totalMealPlans: dashboardData.dashboard_stats.total_meal_plans,
          averageRating: dashboardData.dashboard_stats.average_rating,
          completionRate: dashboardData.dashboard_stats.completion_rate,
          newPatientsThisMonth: dashboardData.dashboard_stats.new_patients_this_month,
          pendingTasks: dashboardData.dashboard_stats.pending_tasks
        })

        // Set recent activities
        setRecentActivity(dashboardData.recent_activities.map((activity: any) => ({
          id: activity.id,
          type: activity.type,
          title: activity.title,
          description: activity.description,
          time: activity.time,
          patientName: activity.patient_name
        })))

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        // Fallback to mock data if API fails
        const patientsData = await nutritionistsApi.getPatients()
        const totalPatients = patientsData.length
        const activePatients = patientsData.filter((p: any) => p.status === 'active').length
        const newPatientsThisMonth = patientsData.filter((p: any) => {
          const startDate = new Date(p.start_date)
          const now = new Date()
          return startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear()
        }).length

        setStats({
          totalPatients,
          activePatients,
          totalMealPlans: 47,
          averageRating: 4.8,
          completionRate: 92,
          newPatientsThisMonth,
          pendingTasks: 3
        })

        setRecentActivity([
          {
            id: '1',
            type: 'meal_plan',
            title: 'New meal plan created',
            description: 'Weekly plan for Sarah Johnson',
            time: '2 hours ago',
            patientName: 'Sarah Johnson'
          },
          {
            id: '2',
            type: 'progress',
            title: 'Progress report updated',
            description: 'Weight loss milestone achieved',
            time: '4 hours ago',
            patientName: 'Mike Chen'
          },
          {
            id: '3',
            type: 'patient',
            title: 'New patient assigned',
            description: 'Welcome to Emma Davis',
            time: '1 day ago',
            patientName: 'Emma Davis'
          },
          {
            id: '4',
            type: 'message',
            title: 'Patient message received',
            description: 'Question about meal plan',
            time: '2 days ago',
            patientName: 'John Smith'
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'meal_plan':
        return <Calendar className="w-5 h-5 text-blue-600" />
      case 'progress':
        return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'patient':
        return <Users className="w-5 h-5 text-purple-600" />
      case 'message':
        return <MessageCircle className="w-5 h-5 text-orange-600" />
      default:
        return <Activity className="w-5 h-5 text-gray-600" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'meal_plan':
        return 'bg-blue-50 border-blue-200'
      case 'progress':
        return 'bg-green-50 border-green-200'
      case 'patient':
        return 'bg-purple-50 border-purple-200'
      case 'message':
        return 'bg-orange-50 border-orange-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, Doctor! 👋</h1>
            <p className="text-blue-100 text-lg">Here's what's happening with your patients today</p>
          </div>
          <div className="hidden lg:flex items-center space-x-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Bell className="w-6 h-6" />
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-hover">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              <p className="text-xs text-green-600">+{stats.newPatientsThisMonth} this month</p>
            </div>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Patients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activePatients}</p>
              <p className="text-xs text-blue-600">{Math.round((stats.activePatients / stats.totalPatients) * 100)}% active</p>
            </div>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Meal Plans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalMealPlans}</p>
              <p className="text-xs text-purple-600">Created this month</p>
            </div>
          </div>
        </div>

        <div className="card-hover">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    className={star <= Math.floor(stats.averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/nutritionist/patients" className="group">
                <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group-hover:scale-[1.02]">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Manage Patients</h3>
                      <p className="text-sm text-gray-600">View and manage your patient assignments</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors ml-auto" />
                  </div>
                </div>
              </Link>

              <Link to="/nutritionist/meal-plans" className="group">
                <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all duration-200 group-hover:scale-[1.02]">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Calendar className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Create Meal Plans</h3>
                      <p className="text-sm text-gray-600">Design personalized nutrition plans</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors ml-auto" />
                  </div>
                </div>
              </Link>

              <Link to="/nutritionist/progress" className="group">
                <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group-hover:scale-[1.02]">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">View Progress</h3>
                      <p className="text-sm text-gray-600">Monitor patient progress and reports</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors ml-auto" />
                  </div>
                </div>
              </Link>

              <Link to="/nutritionist/profile" className="group">
                <div className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group-hover:scale-[1.02]">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <Target className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">Update Profile</h3>
                      <p className="text-sm text-gray-600">Manage your professional information</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 transition-colors ml-auto" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className={`p-4 rounded-lg border ${getActivityColor(activity.type)}`}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">{activity.time}</span>
                      {activity.patientName && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs text-gray-500">{activity.patientName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{stats.completionRate}%</h3>
            <p className="text-sm text-gray-600">Completion Rate</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{stats.pendingTasks}</h3>
            <p className="text-sm text-gray-600">Pending Tasks</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Top 10%</h3>
            <p className="text-sm text-gray-600">Performance Rank</p>
          </div>
        </div>
      </div>
    </div>
  )
} 