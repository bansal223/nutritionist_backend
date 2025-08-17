import React, { useEffect, useState } from 'react'
import { patientsApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

export default function PatientDashboard() {
  const { user } = useAuth()
  const [mealPlan, setMealPlan] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('PatientDashboard: Component mounted')
    
    const fetchData = async () => {
      try {
        console.log('PatientDashboard: Fetching meal plan...')
        const mealPlanData = await patientsApi.getCurrentMealPlan()
        console.log('PatientDashboard: Meal plan data:', mealPlanData)
        setMealPlan(mealPlanData)
      } catch (error) {
        console.error('PatientDashboard: Error fetching meal plan:', error)
        // Don't set mealPlan to null, let it show the error state
      }
      
      try {
        console.log('PatientDashboard: Fetching profile...')
        const profileData = await patientsApi.getProfile()
        console.log('PatientDashboard: Profile data:', profileData)
        setProfile(profileData)
      } catch (error) {
        console.error('PatientDashboard: Error fetching profile:', error)
        // Don't set profile to null, let it show the error state
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
      
      {/* Debug Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Debug Information</h3>
        <div className="text-sm text-yellow-700">
          <p><strong>User ID:</strong> {user?.id || 'Not available'}</p>
          <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
          <p><strong>Role:</strong> {user?.role || 'Not available'}</p>
          <p><strong>Status:</strong> {user?.status || 'Not available'}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Current Meal Plan</h3>
          <p className="text-gray-600">
            {mealPlan ? 'Meal plan loaded' : 'No meal plan available'}
          </p>
          {!mealPlan && (
            <p className="text-sm text-red-500 mt-2">
              No meal plan found. This could be because:
              <br />• You don't have a patient profile
              <br />• No meal plan has been assigned to you
              <br />• You're not logged in as a patient
            </p>
          )}
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
          <p className="text-gray-600">Track your weight and measurements</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Profile</h3>
          <p className="text-gray-600">
            {profile ? 'Profile loaded' : 'Profile not found'}
          </p>
          {!profile && (
            <p className="text-sm text-red-500 mt-2">
              No profile found. This could be because:
              <br />• You haven't created a patient profile yet
              <br />• You're not logged in as a patient
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 