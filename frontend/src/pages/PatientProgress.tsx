import React, { useEffect, useState } from 'react'
import { patientsApi } from '../services/api'

interface ProgressReport {
  id: string
  patient_id: string
  week_start: string
  weight_kg: number
  waist_cm: number
  photos: string[]
  adherence_pct: number
  energy_levels: string
  notes?: string
}

export default function PatientProgress() {
  const [progressReports, setProgressReports] = useState<ProgressReport[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    week_start: new Date().toISOString().split('T')[0],
    weight_kg: 0,
    waist_cm: 0,
    adherence_pct: 100,
    energy_levels: 'good',
    notes: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    console.log('PatientProgress: Component mounted')
    
    const fetchProgressReports = async () => {
      try {
        console.log('PatientProgress: Fetching progress reports...')
        const data = await patientsApi.getProgressReports()
        console.log('PatientProgress: Progress reports data:', data)
        setProgressReports(data || [])
      } catch (error) {
        console.error('PatientProgress: Error fetching progress reports:', error)
        setProgressReports([])
      } finally {
        setLoading(false)
      }
    }

    fetchProgressReports()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      console.log('PatientProgress: Creating progress report...')
      const newReport = await patientsApi.createProgressReport(formData)
      console.log('PatientProgress: Created progress report:', newReport)
      
      // Refresh the list
      const data = await patientsApi.getProgressReports()
      setProgressReports(data || [])
      
      setShowForm(false)
      setFormData({
        week_start: new Date().toISOString().split('T')[0],
        weight_kg: 0,
        waist_cm: 0,
        adherence_pct: 100,
        energy_levels: 'good',
        notes: ''
      })
      
      alert('Progress report created successfully!')
    } catch (error) {
      console.error('PatientProgress: Error creating progress report:', error)
      alert('Error creating progress report. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'weight_kg' || name === 'waist_cm' || name === 'adherence_pct' 
        ? parseFloat(value) || 0 
        : value
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Progress</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Progress</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add Progress Report
        </button>
      </div>

      {/* Create Progress Report Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Create Progress Report</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Week Start Date
                </label>
                <input
                  type="date"
                  name="week_start"
                  value={formData.week_start}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Energy Levels
                </label>
                <select
                  name="energy_levels"
                  value={formData.energy_levels}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight_kg"
                  value={formData.weight_kg}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  min="20"
                  max="500"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Waist (cm)
                </label>
                <input
                  type="number"
                  name="waist_cm"
                  value={formData.waist_cm}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  min="50"
                  max="200"
                  step="0.1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adherence (%)
                </label>
                <input
                  type="number"
                  name="adherence_pct"
                  value={formData.adherence_pct}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                placeholder="Any additional notes about your progress this week"
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Progress Report'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Progress Reports List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Progress History</h2>
        
        {progressReports.length > 0 ? (
          <div className="space-y-4">
            {progressReports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">
                    Week of {new Date(report.week_start).toLocaleDateString()}
                  </h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    report.energy_levels === 'excellent' ? 'bg-green-100 text-green-800' :
                    report.energy_levels === 'good' ? 'bg-blue-100 text-blue-800' :
                    report.energy_levels === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {report.energy_levels.charAt(0).toUpperCase() + report.energy_levels.slice(1)}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Weight:</span>
                    <p className="text-gray-600">{report.weight_kg} kg</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Waist:</span>
                    <p className="text-gray-600">{report.waist_cm} cm</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Adherence:</span>
                    <p className="text-gray-600">{report.adherence_pct}%</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Energy:</span>
                    <p className="text-gray-600">{report.energy_levels}</p>
                  </div>
                </div>
                
                {report.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">{report.notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No progress reports found</p>
            <p className="text-sm text-gray-400 mt-2">
              Start tracking your progress by creating your first report above.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 