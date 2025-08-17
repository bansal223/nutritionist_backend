import React, { useEffect, useState } from 'react'
import { mealPlansApi } from '../services/api'

export default function NutritionistMealPlans() {
  const [mealPlans, setMealPlans] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('NutritionistMealPlans: Component mounted')
    
    const fetchMealPlans = async () => {
      try {
        console.log('NutritionistMealPlans: Fetching meal plans...')
        const data = await mealPlansApi.getAll()
        console.log('NutritionistMealPlans: Meal plans data:', data)
        setMealPlans(data.items || [])
      } catch (error) {
        console.error('NutritionistMealPlans: Error fetching meal plans:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMealPlans()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Meal Plans</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Meal Plans</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
          Create New Meal Plan
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mealPlans.length > 0 ? (
          mealPlans.map((plan: any) => (
            <div key={plan.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">{plan.title}</h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <div className="text-sm text-gray-500">
                <p>Duration: {plan.duration_weeks} weeks</p>
                <p>Status: {plan.status}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No meal plans found</p>
          </div>
        )}
      </div>
    </div>
  )
} 