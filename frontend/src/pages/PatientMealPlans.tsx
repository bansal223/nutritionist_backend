import React, { useEffect, useState } from 'react'
import { patientsApi } from '../services/api'
import { 
  Calendar, 
  Clock, 
  Utensils, 
  Coffee, 
  Apple, 
  Beef, 
  Fish, 
  Carrot,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2
} from 'lucide-react'

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

interface MealInfo {
  name: string
  description: string
  icon: React.ComponentType<any>
  color: string
  bgColor: string
}

const MEAL_TYPES: { [key: string]: MealInfo } = {
  breakfast: {
    name: 'Breakfast',
    description: 'Start your day right',
    icon: Coffee,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  lunch: {
    name: 'Lunch',
    description: 'Midday nourishment',
    icon: Apple,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  dinner: {
    name: 'Dinner',
    description: 'Evening meal',
    icon: Utensils,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  snacks: {
    name: 'Snacks',
    description: 'Healthy between-meal options',
    icon: Carrot,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  }
}

export default function PatientMealPlans() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  const [selectedMeal, setSelectedMeal] = useState<string | null>(null)

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        setLoading(true)
        const mealPlanData = await patientsApi.getCurrentMealPlan()
        setMealPlan(mealPlanData)
        
        // Set current day to today or first day
        if (mealPlanData?.days) {
          const today = new Date().getDay()
          const todayIndex = mealPlanData.days.findIndex((day: any) => 
            day.day_name.toLowerCase().includes(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today])
          )
          setCurrentDayIndex(todayIndex >= 0 ? todayIndex : 0)
        }
      } catch (error) {
        console.error('Error fetching meal plan:', error)
        setMealPlan(null)
      } finally {
        setLoading(false)
      }
    }

    fetchMealPlan()
  }, [])

  const getCurrentDay = () => {
    if (!mealPlan?.days) return null
    return mealPlan.days[currentDayIndex]
  }

  const nextDay = () => {
    if (mealPlan?.days && currentDayIndex < mealPlan.days.length - 1) {
      setCurrentDayIndex(currentDayIndex + 1)
    }
  }

  const prevDay = () => {
    if (currentDayIndex > 0) {
      setCurrentDayIndex(currentDayIndex - 1)
    }
  }

  const getAdherenceStatus = () => {
    // Mock adherence calculation - in real app this would come from progress reports
    const adherence = Math.floor(Math.random() * 40) + 60 // 60-100%
    if (adherence >= 90) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-50' }
    if (adherence >= 75) return { status: 'good', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    return { status: 'needs improvement', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const downloadMealPlan = () => {
    if (!mealPlan) return
    
    const content = `Meal Plan for Week of ${new Date(mealPlan.week_start).toLocaleDateString()}\n\n` +
      mealPlan.days.map(day => 
        `${day.day_name}:\n` +
        `Breakfast: ${day.breakfast}\n` +
        `Lunch: ${day.lunch}\n` +
        `Dinner: ${day.dinner}\n` +
        `${day.snacks ? `Snacks: ${day.snacks}\n` : ''}`
      ).join('\n\n')
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meal-plan-${new Date(mealPlan.week_start).toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareMealPlan = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Meal Plan',
        text: `Check out my personalized meal plan for the week of ${mealPlan ? new Date(mealPlan.week_start).toLocaleDateString() : ''}`,
        url: window.location.href
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Meal Plans</h1>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading meal plan...</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 animate-pulse">
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Meal Plans</h1>
          <p className="text-gray-600 mt-1">
            Your personalized nutrition plan
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={downloadMealPlan}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
          <button
            onClick={shareMealPlan}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {mealPlan ? (
        <>
          {/* Meal Plan Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Week of {new Date(mealPlan.week_start).toLocaleDateString()}
                </h2>
                <p className="text-gray-600">7-day personalized meal plan</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{mealPlan.days?.length || 0}</div>
                  <div className="text-sm text-gray-600">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">21</div>
                  <div className="text-sm text-gray-600">Meals</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">4</div>
                  <div className="text-sm text-gray-600">Meal Types</div>
                </div>
              </div>
            </div>
            
            {mealPlan.notes && (
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <h3 className="font-semibold text-gray-900 mb-2">Nutritionist Notes</h3>
                <p className="text-gray-700">{mealPlan.notes}</p>
              </div>
            )}
          </div>

          {/* Daily Meal Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Daily Meals</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={prevDay}
                  disabled={currentDayIndex === 0}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-medium text-gray-600">
                  {currentDayIndex + 1} of {mealPlan.days?.length || 0}
                </span>
                <button
                  onClick={nextDay}
                  disabled={currentDayIndex === (mealPlan.days?.length || 0) - 1}
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Day Selector */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
              {mealPlan.days?.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentDayIndex(index)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentDayIndex === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {day.day_name}
                </button>
              ))}
            </div>

                         {/* Current Day Meals */}
             {getCurrentDay() && (
               <div className="space-y-6">
                 {Object.entries(MEAL_TYPES).map(([mealKey, mealInfo]) => {
                   const Icon = mealInfo.icon
                   const currentDay = getCurrentDay()
                   const mealContent = currentDay ? (currentDay as any)[mealKey] : null
                   
                   if (!mealContent) return null

                   return (
                     <div
                       key={mealKey}
                       className={`${mealInfo.bgColor} rounded-xl p-6 border border-gray-200 hover:shadow-md transition-shadow cursor-pointer`}
                       onClick={() => setSelectedMeal(selectedMeal === mealKey ? null : mealKey)}
                     >
                       <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                           <div className={`p-3 rounded-lg bg-white ${mealInfo.color}`}>
                             <Icon className="w-6 h-6" />
                           </div>
                           <div>
                             <h3 className="text-lg font-semibold text-gray-900">{mealInfo.name}</h3>
                             <p className="text-sm text-gray-600">{mealInfo.description}</p>
                           </div>
                         </div>
                         <div className="flex items-center space-x-2">
                           <span className="text-sm text-gray-500">Click to expand</span>
                           <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${
                             selectedMeal === mealKey ? 'rotate-90' : ''
                           }`} />
                         </div>
                       </div>
                       
                       {selectedMeal === mealKey && (
                         <div className="mt-4 pt-4 border-t border-gray-200">
                           <div className="bg-white rounded-lg p-4">
                             <h4 className="font-medium text-gray-900 mb-2">Meal Details</h4>
                             <p className="text-gray-700 leading-relaxed">{mealContent}</p>
                             
                             {/* Mock nutritional info */}
                             <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                               <div className="text-center">
                                 <div className="font-semibold text-blue-600">450</div>
                                 <div className="text-gray-600">Calories</div>
                               </div>
                               <div className="text-center">
                                 <div className="font-semibold text-green-600">25g</div>
                                 <div className="text-gray-600">Protein</div>
                               </div>
                               <div className="text-center">
                                 <div className="font-semibold text-yellow-600">45g</div>
                                 <div className="text-gray-600">Carbs</div>
                               </div>
                               <div className="text-center">
                                 <div className="font-semibold text-red-600">15g</div>
                                 <div className="text-gray-600">Fat</div>
                               </div>
                             </div>
                           </div>
                         </div>
                       )}
                     </div>
                   )
                 })}
               </div>
             )}
          </div>

          {/* Weekly Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">85%</div>
                <div className="text-sm text-gray-600">Adherence Rate</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">18/21</div>
                <div className="text-sm text-gray-600">Meals Completed</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <AlertCircle className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">3</div>
                <div className="text-sm text-gray-600">Meals Remaining</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Meal Plan Available</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Your nutritionist hasn't created a meal plan for you yet. 
            Please check back later or contact your nutritionist to get started.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>Waiting for nutritionist</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 