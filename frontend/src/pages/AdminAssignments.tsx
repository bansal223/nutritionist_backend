import React, { useEffect, useState } from 'react'
import { assignmentsApi, adminApi } from '../services/api'

export default function AdminAssignments() {
  const [assignments, setAssignments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    patient_id: '',
    nutritionist_id: '',
    start_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  useEffect(() => {
    console.log('AdminAssignments: Component mounted')
    
    const fetchData = async () => {
      try {
        console.log('AdminAssignments: Fetching assignments...')
        const assignmentsData = await assignmentsApi.getAll()
        console.log('AdminAssignments: Assignments data:', assignmentsData)
        setAssignments(assignmentsData)
        
        console.log('AdminAssignments: Fetching users...')
        const usersData = await adminApi.getUsers()
        console.log('AdminAssignments: Users data:', usersData)
        setUsers(usersData.items || [])
      } catch (error) {
        console.error('AdminAssignments: Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      console.log('AdminAssignments: Creating assignment...')
      const assignmentData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString()
      }
      
      await assignmentsApi.create(assignmentData)
      
      // Refresh assignments list
      const assignmentsData = await assignmentsApi.getAll()
      setAssignments(assignmentsData)
      
      // Reset form
      setFormData({
        patient_id: '',
        nutritionist_id: '',
        start_date: new Date().toISOString().split('T')[0],
        notes: ''
      })
      
      alert('Assignment created successfully!')
    } catch (error) {
      console.error('AdminAssignments: Error creating assignment:', error)
      alert('Error creating assignment. Check console for details.')
    }
  }

  const getPatients = () => users.filter(user => user.role === 'patient')
  const getNutritionists = () => users.filter(user => user.role === 'nutritionist')

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Assignments</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Manage Assignments</h1>
      
      {/* Create Assignment Form */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Create New Assignment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient
              </label>
              <select
                value={formData.patient_id}
                onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select Patient</option>
                {getPatients().map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.email}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nutritionist
              </label>
              <select
                value={formData.nutritionist_id}
                onChange={(e) => setFormData({...formData, nutritionist_id: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select Nutritionist</option>
                {getNutritionists().map((nutritionist) => (
                  <option key={nutritionist.id} value={nutritionist.id}>
                    {nutritionist.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="Optional notes"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create Assignment
          </button>
        </form>
      </div>
      
      {/* Assignments List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Current Assignments</h2>
        
        {assignments.length > 0 ? (
          <div className="space-y-4">
            {assignments.map((assignment: any) => (
              <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">Patient ID: {assignment.patient_id}</p>
                    <p className="font-medium">Nutritionist ID: {assignment.nutritionist_id}</p>
                    <p className="text-sm text-gray-600">
                      Start Date: {new Date(assignment.start_date).toLocaleDateString()}
                    </p>
                    {assignment.end_date && (
                      <p className="text-sm text-gray-600">
                        End Date: {new Date(assignment.end_date).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      Status: {assignment.active ? 'Active' : 'Inactive'}
                    </p>
                    {assignment.notes && (
                      <p className="text-sm text-gray-600">Notes: {assignment.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No assignments found</p>
        )}
      </div>
    </div>
  )
} 