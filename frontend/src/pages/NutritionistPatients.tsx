import React, { useEffect, useState } from 'react'
import { nutritionistsApi } from '../services/api'
import { 
  User, 
  Mail, 
  Calendar, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Heart,
  MessageCircle,
  BarChart3,
  Search,
  Filter
} from 'lucide-react'

interface Patient {
  assignment_id: string
  patient_id: string
  patient_name: string
  patient_email: string
  start_date: string
  current_weight?: number
  status: string
  has_profile: boolean
}

export default function NutritionistPatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    console.log('NutritionistPatients: Component mounted')
    
    const fetchPatients = async () => {
      try {
        console.log('NutritionistPatients: Fetching patients...')
        const data = await nutritionistsApi.getPatients()
        console.log('NutritionistPatients: Patients data:', data)
        setPatients(data || [])
      } catch (error) {
        console.error('NutritionistPatients: Error fetching patients:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.patient_email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && patient.status === 'active') ||
                         (filterStatus === 'inactive' && patient.status !== 'active')
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProfileStatus = (hasProfile: boolean) => {
    return hasProfile ? (
      <div className="flex items-center space-x-1 text-green-600">
        <CheckCircle size={14} />
        <span className="text-xs font-medium">Profile Complete</span>
      </div>
    ) : (
      <div className="flex items-center space-x-1 text-orange-600">
        <AlertCircle size={14} />
        <span className="text-xs font-medium">Profile Pending</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
          <p className="text-gray-600 mt-1">Manage and monitor your patient assignments</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {patients.length} Total Patients
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search patients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Patients</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Patients</p>
              <p className="text-2xl font-bold text-gray-900">
                {patients.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Profiles Complete</p>
              <p className="text-2xl font-bold text-gray-900">
                {patients.filter(p => p.has_profile).length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {patients.filter(p => {
                  const startDate = new Date(p.start_date)
                  const now = new Date()
                  return startDate.getMonth() === now.getMonth() && startDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <div key={patient.patient_id} className="card-hover group">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {patient.patient_name}
                    </h3>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Mail size={14} />
                      <span className="text-sm">{patient.patient_email}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                  {patient.status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Calendar size={14} />
                    <span>Started</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {new Date(patient.start_date).toLocaleDateString()}
                  </span>
                </div>

                {patient.current_weight ? (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <TrendingUp size={14} />
                      <span>Current Weight</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {patient.current_weight} kg
                    </span>
                  </div>
                ) : null}

                <div className="pt-2 border-t border-gray-100">
                  {getProfileStatus(patient.has_profile)}
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 btn-secondary flex items-center justify-center space-x-1 text-sm">
                  <MessageCircle size={14} />
                  <span>Message</span>
                </button>
                <button className="flex-1 btn-primary flex items-center justify-center space-x-1 text-sm">
                  <BarChart3 size={14} />
                  <span>View Progress</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No patients have been assigned to you yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 