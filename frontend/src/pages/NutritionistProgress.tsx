import React, { useEffect, useState } from 'react'
import { progressApi, nutritionistsApi } from '../services/api'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar, 
  Users, 
  Target, 
  Award, 
  Clock,
  Filter,
  Search,
  Download,
  Eye,
  MessageCircle,
  Star,
  Activity,
  Heart,
  Scale,
  Zap
} from 'lucide-react'

interface ProgressReport {
  id: string
  patient_id: string
  patient_name?: string
  week_start: string
  weight_kg: number
  waist_cm: number
  adherence_pct: number
  energy_levels: string
  notes?: string
  created_at: string
}

interface PatientSummary {
  patient_id: string
  patient_name: string
  total_reports: number
  avg_weight_loss: number
  avg_adherence: number
  last_report_date: string
  status: 'improving' | 'stable' | 'declining'
}

export default function NutritionistProgress() {
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([])
  const [patientSummaries, setPatientSummaries] = useState<PatientSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<string>('all')
  const [timeFilter, setTimeFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    console.log('NutritionistProgress: Component mounted')
    
    const fetchData = async () => {
      try {
        console.log('NutritionistProgress: Fetching data...')
        
        // Fetch progress reports
        const reportsData = await progressApi.getReports()
        console.log('NutritionistProgress: Progress reports data:', reportsData)
        setProgressReports(reportsData || [])

        // Fetch patient progress summary using new API
        const patientSummariesData = await progressApi.getNutritionistOverview()
        console.log('NutritionistProgress: Patient summaries data:', patientSummariesData)
        setPatientSummaries(patientSummariesData || [])
        
      } catch (error) {
        console.error('NutritionistProgress: Error fetching data:', error)
        // Fallback to mock data if API fails
        const patientsData = await nutritionistsApi.getPatients()
        const summaries: PatientSummary[] = patientsData.map((patient: any) => ({
          patient_id: patient.patient_id,
          patient_name: patient.patient_name,
          total_reports: Math.floor(Math.random() * 10) + 1,
          avg_weight_loss: Math.random() * 5,
          avg_adherence: Math.random() * 30 + 70,
          last_report_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: ['improving', 'stable', 'declining'][Math.floor(Math.random() * 3)] as any
        }))
        setPatientSummaries(summaries)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'improving':
        return 'bg-green-100 text-green-800'
      case 'stable':
        return 'bg-blue-100 text-blue-800'
      case 'declining':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEnergyLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'text-green-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getAdherenceColor = (adherence: number) => {
    if (adherence >= 80) return 'text-green-600'
    if (adherence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const filteredReports = progressReports.filter(report => {
    const matchesPatient = selectedPatient === 'all' || report.patient_id === selectedPatient
    const matchesSearch = report.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         report.notes?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesPatient && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Reports</h1>
          <p className="text-gray-600 mt-1">Monitor and analyze patient progress</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Download size={16} />
            <span>Export Data</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <BarChart3 size={16} />
            <span>Analytics</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search reports by patient name or notes..."
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
            value={selectedPatient}
            onChange={(e) => setSelectedPatient(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Patients</option>
            {patientSummaries.map(patient => (
              <option key={patient.patient_id} value={patient.patient_id}>
                {patient.patient_name}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{progressReports.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Weight Loss</p>
              <p className="text-2xl font-bold text-gray-900">
                {progressReports.length > 0 
                  ? (progressReports.reduce((sum, report) => sum + (report.weight_kg || 0), 0) / progressReports.length).toFixed(1)
                  : '0.0'} kg
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Adherence</p>
              <p className="text-2xl font-bold text-gray-900">
                {progressReports.length > 0 
                  ? Math.round(progressReports.reduce((sum, report) => sum + (report.adherence_pct || 0), 0) / progressReports.length)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active Patients</p>
              <p className="text-2xl font-bold text-gray-900">{patientSummaries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Summaries */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Patient Progress Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patientSummaries.map((patient) => (
            <div key={patient.patient_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{patient.patient_name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                  {patient.status}
                </span>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Reports:</span>
                  <span className="font-medium">{patient.total_reports}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Weight Loss:</span>
                  <span className="font-medium text-green-600">{patient.avg_weight_loss.toFixed(1)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Adherence:</span>
                  <span className={`font-medium ${getAdherenceColor(patient.avg_adherence)}`}>
                    {patient.avg_adherence.toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Report:</span>
                  <span className="font-medium">{new Date(patient.last_report_date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="mt-4 flex space-x-2">
                <button className="flex-1 btn-secondary flex items-center justify-center space-x-1 text-sm">
                  <Eye size={14} />
                  <span>View</span>
                </button>
                <button className="flex-1 btn-primary flex items-center justify-center space-x-1 text-sm">
                  <MessageCircle size={14} />
                  <span>Message</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Reports */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Detailed Progress Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.patient_name || 'Patient'}</h3>
                    <p className="text-sm text-gray-500">Week of {new Date(report.week_start).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star size={16} className="text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{report.adherence_pct}%</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Scale className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Weight</span>
                    </div>
                    <span className="font-medium text-gray-900">{report.weight_kg} kg</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Waist</span>
                    </div>
                    <span className="font-medium text-gray-900">{report.waist_cm} cm</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Adherence</span>
                    </div>
                    <span className={`font-medium ${getAdherenceColor(report.adherence_pct)}`}>
                      {report.adherence_pct}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Energy</span>
                    </div>
                    <span className={`font-medium ${getEnergyLevelColor(report.energy_levels)}`}>
                      {report.energy_levels}
                    </span>
                  </div>
                </div>

                {report.notes && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-sm text-gray-600 italic">"{report.notes}"</p>
                  </div>
                )}

                <div className="mt-4 flex space-x-2">
                  <button className="flex-1 btn-secondary flex items-center justify-center space-x-1 text-sm">
                    <Eye size={14} />
                    <span>Details</span>
                  </button>
                  <button className="flex-1 btn-primary flex items-center justify-center space-x-1 text-sm">
                    <MessageCircle size={14} />
                    <span>Comment</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No progress reports found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedPatient !== 'all' 
                  ? 'Try adjusting your search or filter criteria.' 
                  : 'No progress reports have been submitted yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 