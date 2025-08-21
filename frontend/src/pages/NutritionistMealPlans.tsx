import React, { useEffect, useState } from 'react'
import { mealPlansApi, nutritionistsApi } from '../services/api'

interface Patient {
  patient_id: string
  patient_name: string
  patient_email: string
  has_profile: boolean
}

interface Meal {
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  title: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  notes?: string
}

interface DayPlan {
  day_of_week: number
  meals: Meal[]
}

interface MealPlanForm {
  patient_id: string
  week_start: string
  notes: string
  status: 'draft' | 'published'
  days: DayPlan[]
}

export default function NutritionistMealPlans() {
  const [mealPlans, setMealPlans] = useState([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [formData, setFormData] = useState<MealPlanForm>({
    patient_id: '',
    week_start: '',
    notes: '',
    status: 'draft',
    days: []
  })

  useEffect(() => {
    console.log('NutritionistMealPlans: Component mounted')
    
    const fetchData = async () => {
      try {
        console.log('NutritionistMealPlans: Fetching data...')
        const [mealPlansData, patientsData] = await Promise.all([
          mealPlansApi.getAll(),
          nutritionistsApi.getPatients()
        ])
        console.log('NutritionistMealPlans: Meal plans data:', mealPlansData)
        console.log('NutritionistMealPlans: Patients data:', patientsData)
        setMealPlans(mealPlansData || [])
        setPatients(patientsData || [])
      } catch (error) {
        console.error('NutritionistMealPlans: Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCreateMealPlan = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      console.log('NutritionistMealPlans: Creating meal plan...')
      console.log('NutritionistMealPlans: Form data:', formData)
      
      // Validate form data
      if (!formData.patient_id) {
        throw new Error('Please select a patient')
      }
      if (!formData.week_start) {
        throw new Error('Please select a week start date')
      }
      if (formData.days.length === 0) {
        throw new Error('Please add at least one day to the meal plan')
      }

      // Validate that each day has at least one meal
      for (let i = 0; i < formData.days.length; i++) {
        if (formData.days[i].meals.length === 0) {
          throw new Error(`Day ${i + 1} has no meals. Please add at least one meal.`)
        }
      }

      const newMealPlan = await mealPlansApi.create(formData)
      console.log('NutritionistMealPlans: Created meal plan:', newMealPlan)
      
      // Refresh meal plans list
      const updatedMealPlans = await mealPlansApi.getAll()
      setMealPlans(updatedMealPlans || [])
      
      // Reset form
      setFormData({
        patient_id: '',
        week_start: '',
        notes: '',
        status: 'draft',
        days: []
      })
      setShowCreateForm(false)
      alert('Meal plan created successfully!')
    } catch (error: any) {
      console.error('NutritionistMealPlans: Error creating meal plan:', error)
      const errorMessage = error.response?.data?.detail || error.message || 'Error creating meal plan. Please try again.'
      alert(errorMessage)
    } finally {
      setCreating(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addDay = () => {
    const newDay: DayPlan = {
      day_of_week: formData.days.length,
      meals: []
    }
    setFormData(prev => ({
      ...prev,
      days: [...prev.days, newDay]
    }))
  }

  const removeDay = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.filter((_, index) => index !== dayIndex)
    }))
  }

  const addMeal = (dayIndex: number) => {
    const newMeal: Meal = {
      meal_type: 'breakfast',
      title: '',
      calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
      notes: ''
    }
    
    setFormData(prev => ({
      ...prev,
      days: prev.days.map((day, index) => 
        index === dayIndex 
          ? { ...day, meals: [...day.meals, newMeal] }
          : day
      )
    }))
  }

  const removeMeal = (dayIndex: number, mealIndex: number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.map((day, index) => 
        index === dayIndex 
          ? { ...day, meals: day.meals.filter((_, mIndex) => mIndex !== mealIndex) }
          : day
      )
    }))
  }

  const updateMeal = (dayIndex: number, mealIndex: number, field: keyof Meal, value: any) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.map((day, index) => 
        index === dayIndex 
          ? {
              ...day,
              meals: day.meals.map((meal, mIndex) => 
                mIndex === mealIndex 
                  ? { ...meal, [field]: value }
                  : meal
              )
            }
          : day
      )
    }))
  }

  const createSampleMealPlan = () => {
    if (!formData.patient_id) {
      alert('Please select a patient first')
      return
    }
    if (!formData.week_start) {
      alert('Please select a week start date first')
      return
    }

    const sampleDays: DayPlan[] = [
      {
        day_of_week: 0, // Monday
        meals: [
          {
            meal_type: 'breakfast',
            title: 'Oatmeal with Berries',
            calories: 300,
            protein_g: 12,
            carbs_g: 45,
            fat_g: 8,
            notes: 'Add honey for sweetness'
          },
          {
            meal_type: 'lunch',
            title: 'Grilled Chicken Salad',
            calories: 400,
            protein_g: 35,
            carbs_g: 15,
            fat_g: 20,
            notes: 'Use mixed greens'
          },
          {
            meal_type: 'dinner',
            title: 'Salmon with Vegetables',
            calories: 500,
            protein_g: 40,
            carbs_g: 25,
            fat_g: 25,
            notes: 'Steam the vegetables'
          }
        ]
      },
      {
        day_of_week: 1, // Tuesday
        meals: [
          {
            meal_type: 'breakfast',
            title: 'Greek Yogurt with Nuts',
            calories: 350,
            protein_g: 20,
            carbs_g: 20,
            fat_g: 15,
            notes: 'Add fresh fruit'
          },
          {
            meal_type: 'lunch',
            title: 'Quinoa Bowl',
            calories: 450,
            protein_g: 15,
            carbs_g: 60,
            fat_g: 12,
            notes: 'Include colorful vegetables'
          }
        ]
      }
    ]

    setFormData(prev => ({
      ...prev,
      days: sampleDays
    }))
  }

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
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create New Meal Plan
        </button>
      </div>

      {/* Create Meal Plan Form */}
      {showCreateForm && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Create New Meal Plan</h2>
            <button 
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleCreateMealPlan} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient
                </label>
                <select
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient.patient_id} value={patient.patient_id}>
                      {patient.patient_name} ({patient.patient_email})
                    </option>
                  ))}
                </select>
              </div>

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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Days and Meals */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Meal Plan Days</h3>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={createSampleMealPlan}
                    className="bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700 text-sm"
                  >
                    Quick Create Sample
                  </button>
                  <button
                    type="button"
                    onClick={addDay}
                    className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 text-sm"
                  >
                    Add Day
                  </button>
                </div>
              </div>

              {formData.days.map((day, dayIndex) => (
                <div key={dayIndex} className="border border-gray-200 rounded-md p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Day {dayIndex + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeDay(dayIndex)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove Day
                    </button>
                  </div>

                  <div className="space-y-3">
                    {day.meals.map((meal, mealIndex) => (
                      <div key={mealIndex} className="border border-gray-100 rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium">Meal {mealIndex + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeMeal(dayIndex, mealIndex)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Meal Type
                            </label>
                            <select
                              value={meal.meal_type}
                              onChange={(e) => updateMeal(dayIndex, mealIndex, 'meal_type', e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                            >
                              <option value="breakfast">Breakfast</option>
                              <option value="lunch">Lunch</option>
                              <option value="dinner">Dinner</option>
                              <option value="snack">Snack</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={meal.title}
                              onChange={(e) => updateMeal(dayIndex, mealIndex, 'title', e.target.value)}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                              placeholder="Meal title"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Calories
                            </label>
                            <input
                              type="number"
                              value={meal.calories}
                              onChange={(e) => updateMeal(dayIndex, mealIndex, 'calories', parseInt(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Protein (g)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={meal.protein_g}
                              onChange={(e) => updateMeal(dayIndex, mealIndex, 'protein_g', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Carbs (g)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={meal.carbs_g}
                              onChange={(e) => updateMeal(dayIndex, mealIndex, 'carbs_g', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Fat (g)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              value={meal.fat_g}
                              onChange={(e) => updateMeal(dayIndex, mealIndex, 'fat_g', parseFloat(e.target.value) || 0)}
                              className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                            />
                          </div>
                        </div>

                        <div className="mt-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Notes
                          </label>
                          <input
                            type="text"
                            value={meal.notes || ''}
                            onChange={(e) => updateMeal(dayIndex, mealIndex, 'notes', e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                            placeholder="Optional notes"
                          />
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => addMeal(dayIndex)}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 text-sm"
                    >
                      Add Meal
                    </button>
                  </div>
                </div>
              ))}

              {formData.days.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No days added yet. Click "Add Day" to start building the meal plan.
                </p>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || formData.days.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Meal Plan'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mealPlans.length > 0 ? (
          mealPlans.map((plan: any) => (
            <div key={plan.id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">Week of {new Date(plan.week_start).toLocaleDateString()}</h3>
              <p className="text-gray-600 mb-4">{plan.notes || 'No notes'}</p>
              <div className="text-sm text-gray-500">
                <p>Patient: {plan.patient_id}</p>
                <p>Status: {plan.status}</p>
                <p>Days: {plan.days?.length || 0}</p>
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