import React, { useEffect, useState } from 'react'
import { nutritionistsApi } from '../services/api'

export default function NutritionistPatients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('NutritionistPatients: Component mounted')
    
    const fetchPatients = async () => {
      try {
        console.log('NutritionistPatients: Fetching patients...')
        const data = await nutritionistsApi.getPatients()
        console.log('NutritionistPatients: Patients data:', data)
        setPatients(data.items || [])
      } catch (error) {
        console.error('NutritionistPatients: Error fetching patients:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.length > 0 ? (
          patients.map((patient: any) => (
            <div key={patient.patient_id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">{patient.patient_name}</h3>
              <p className="text-gray-600 mb-4">{patient.patient_email}</p>
              <div className="text-sm text-gray-500">
                <p>Start Date: {new Date(patient.start_date).toLocaleDateString()}</p>
                <p>Current Weight: {patient.current_weight} kg</p>
                <p>Status: {patient.status}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No patients assigned yet</p>
          </div>
        )}
      </div>
    </div>
  )
} 