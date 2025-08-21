import React, { useEffect, useState } from 'react'
import { patientsApi } from '../services/api'

interface MealPlan {
  id: string
  patient_id: string
  nutritionist_id: string
  week_start: string
  notes?: string
  status: string
  days: Array<{
    day_name: string
    breakfast: string
    lunch: string
    dinner: string
    snacks?: string
  }>
}

export default function PatientMealPlans() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('PatientMealPlans: Component mounted')
    
    const fetchMealPlan = async () => {
      try {
        console.log('PatientMealPlans: Fetching meal plan...')
        const mealPlanData = await patientsApi.getCurrentMealPlan()
        console.log('PatientMealPlans: Meal plan data:', mealPlanData)
        setMealPlan(mealPlanData)
      } catch (error) {
        console.error('PatientMealPlans: Error fetching meal plan:', error)
        setMealPlan(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMealPlan()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Meal Plans</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Meal Plans</h1>
      
      {mealPlan ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">
            Meal Plan for Week of {new Date(mealPlan.week_start).toLocaleDateString()}
          </h2>
          
          {mealPlan.notes && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">{mealPlan.notes}</p>
            </div>
          )}
          
          <div className="space-y-4">
            {mealPlan.days && mealPlan.days.map((day: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold mb-2">{day.day_name}</h3>
                
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-sm text-gray-700">Breakfast:</span>
                    <p className="text-sm text-gray-600 ml-2">{day.breakfast}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-sm text-gray-700">Lunch:</span>
                    <p className="text-sm text-gray-600 ml-2">{day.lunch}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-sm text-gray-700">Dinner:</span>
                    <p className="text-sm text-gray-600 ml-2">{day.dinner}</p>
                  </div>
                  
                  {day.snacks && (
                    <div>
                      <span className="font-medium text-sm text-gray-700">Snacks:</span>
                      <p className="text-sm text-gray-600 ml-2">{day.snacks}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h2 className="text-lg font-semibold mb-4">No Meal Plan Available</h2>
          <p className="text-gray-600">
            Your nutritionist hasn't created a meal plan for you yet. 
            Please check back later or contact your nutritionist.
          </p>
        </div>
      )}
    </div>
  )
} 