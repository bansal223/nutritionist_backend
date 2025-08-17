import React, { useEffect, useState } from 'react'
import { progressApi } from '../services/api'

export default function NutritionistProgress() {
  const [progressReports, setProgressReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('NutritionistProgress: Component mounted')
    
    const fetchProgressReports = async () => {
      try {
        console.log('NutritionistProgress: Fetching progress reports...')
        const data = await progressApi.getReports()
        console.log('NutritionistProgress: Progress reports data:', data)
        setProgressReports(data.items || [])
      } catch (error) {
        console.error('NutritionistProgress: Error fetching progress reports:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProgressReports()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Progress Reports</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Progress Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {progressReports.length > 0 ? (
          progressReports.map((report: any) => (
            <div key={report.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Week of {new Date(report.week_start).toLocaleDateString()}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Weight: {report.weight_kg} kg</p>
                <p>Waist: {report.waist_cm} cm</p>
                <p>Adherence: {report.adherence_pct}%</p>
                <p>Energy Level: {report.energy_levels}</p>
              </div>
              {report.notes && (
                <p className="text-sm text-gray-500 mt-2">{report.notes}</p>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No progress reports found</p>
          </div>
        )}
      </div>
    </div>
  )
} 