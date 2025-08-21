import React, { useEffect, useState } from 'react'
import { patientsApi } from '../services/api'
import { 
  User, 
  Calendar, 
  Ruler, 
  Scale, 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  Edit3, 
  Save, 
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface ProfileData {
  first_name: string
  last_name: string
  dob: string
  height_cm: number
  start_weight_kg: number
  gender: 'male' | 'female' | 'other'
  allergies: string[]
  dietary_prefs: string[]
  medical_notes?: string
}

interface FormErrors {
  [key: string]: string
}

const DIETARY_PREFERENCES = [
  'vegetarian',
  'vegan',
  'gluten_free',
  'dairy_free',
  'low_carb',
  'keto',
  'paleo',
  'mediterranean',
  'pescatarian',
  'none'
]

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }
]

export default function PatientProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [newAllergy, setNewAllergy] = useState('')
  const [showDietaryPrefs, setShowDietaryPrefs] = useState(false)
  
  const [formData, setFormData] = useState<ProfileData>({
    first_name: '',
    last_name: '',
    dob: '',
    height_cm: 0,
    start_weight_kg: 0,
    gender: 'male',
    allergies: [],
    dietary_prefs: [],
    medical_notes: ''
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const profileData = await patientsApi.getProfile()
        setProfile(profileData)
        setFormData({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          dob: profileData.dob ? new Date(profileData.dob).toISOString().split('T')[0] : '',
          height_cm: profileData.height_cm || 0,
          start_weight_kg: profileData.start_weight_kg || 0,
          gender: profileData.gender || 'male',
          allergies: profileData.allergies || [],
          dietary_prefs: profileData.dietary_prefs || [],
          medical_notes: profileData.medical_notes || ''
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required'
    } else {
      const age = new Date().getFullYear() - new Date(formData.dob).getFullYear()
      if (age < 13 || age > 120) {
        newErrors.dob = 'Please enter a valid date of birth'
      }
    }

    if (formData.height_cm <= 0 || formData.height_cm > 300) {
      newErrors.height_cm = 'Please enter a valid height (1-300 cm)'
    }

    if (formData.start_weight_kg <= 0 || formData.start_weight_kg > 500) {
      newErrors.start_weight_kg = 'Please enter a valid weight (1-500 kg)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    setErrors({})

    try {
      const apiData = {
        ...formData,
        dob: formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : null
      }
      
      let savedProfile
      if (profile) {
        savedProfile = await patientsApi.updateProfile(apiData)
      } else {
        savedProfile = await patientsApi.createProfile(apiData)
      }
      
      setProfile(savedProfile)
      setEditing(false)
      
      // Show success message
      const successMessage = document.createElement('div')
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2'
      successMessage.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span>Profile saved successfully!</span>
      `
      document.body.appendChild(successMessage)
      setTimeout(() => document.body.removeChild(successMessage), 3000)
      
    } catch (error: any) {
      console.error('Error saving profile:', error)
      const errorMessage = error.response?.data?.detail || 'Error saving profile. Please try again.'
      
      const errorDiv = document.createElement('div')
      errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2'
      errorDiv.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <span>${errorMessage}</span>
      `
      document.body.appendChild(errorDiv)
      setTimeout(() => document.body.removeChild(errorDiv), 5000)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'height_cm' || name === 'start_weight_kg' 
        ? parseFloat(value) || 0 
        : value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const addAllergy = () => {
    if (newAllergy.trim() && !formData.allergies.includes(newAllergy.trim())) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }))
      setNewAllergy('')
    }
  }

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }))
  }

  const toggleDietaryPref = (pref: string) => {
    setFormData(prev => ({
      ...prev,
      dietary_prefs: prev.dietary_prefs.includes(pref)
        ? prev.dietary_prefs.filter(p => p !== pref)
        : [...prev.dietary_prefs, pref]
    }))
  }

  const InputField = ({ 
    label, 
    name, 
    type = 'text', 
    placeholder, 
    icon: Icon, 
    required = false,
    min,
    max,
    step
  }: any) => (
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
        <Icon className="w-4 h-4" />
        <span>{label}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name as keyof ProfileData] as string}
        onChange={handleInputChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
          errors[name] ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        disabled={!editing}
      />
      {errors[name] && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3" />
          <span>{errors[name]}</span>
        </p>
      )}
    </div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading profile...</span>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 animate-pulse">
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">
            Manage your personal and health information
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {editing ? (
            <>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {/* Personal Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <User className="w-5 h-5 text-blue-600" />
              <span>Personal Information</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="First Name"
                name="first_name"
                placeholder="Enter your first name"
                icon={User}
                required
              />
              <InputField
                label="Last Name"
                name="last_name"
                placeholder="Enter your last name"
                icon={User}
                required
              />
              <InputField
                label="Date of Birth"
                name="dob"
                type="date"
                icon={Calendar}
                required
              />
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Heart className="w-4 h-4" />
                  <span>Gender</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400 disabled:bg-gray-50"
                >
                  {GENDER_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Physical Measurements */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Scale className="w-5 h-5 text-green-600" />
              <span>Physical Measurements</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Height (cm)"
                name="height_cm"
                type="number"
                placeholder="170"
                icon={Ruler}
                required
                min="50"
                max="300"
                step="0.1"
              />
              <InputField
                label="Starting Weight (kg)"
                name="start_weight_kg"
                type="number"
                placeholder="70.5"
                icon={Scale}
                required
                min="20"
                max="500"
                step="0.1"
              />
            </div>
          </div>

          {/* Dietary Preferences */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-purple-600" />
              <span>Dietary Preferences</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Select your dietary preferences</p>
                <button
                  type="button"
                  onClick={() => setShowDietaryPrefs(!showDietaryPrefs)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                >
                  <span>{showDietaryPrefs ? 'Hide' : 'Show'} options</span>
                  {showDietaryPrefs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
              
              {showDietaryPrefs && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {DIETARY_PREFERENCES.map(pref => (
                    <label
                      key={pref}
                      className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.dietary_prefs.includes(pref)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!editing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.dietary_prefs.includes(pref)}
                        onChange={() => editing && toggleDietaryPref(pref)}
                        disabled={!editing}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium capitalize">
                        {pref.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              
              {formData.dietary_prefs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.dietary_prefs.map(pref => (
                    <span
                      key={pref}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full capitalize"
                    >
                      {pref.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Allergies */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>Allergies & Sensitivities</span>
            </h2>
            
            <div className="space-y-4">
              {editing && (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Add an allergy (e.g., peanuts, shellfish)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                  />
                  <button
                    type="button"
                    onClick={addAllergy}
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              )}
              
              {formData.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {formData.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full"
                    >
                      <span>{allergy}</span>
                      {editing && (
                        <button
                          type="button"
                          onClick={() => removeAllergy(index)}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No allergies listed</p>
              )}
            </div>
          </div>

          {/* Medical Notes */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span>Medical Notes</span>
            </h2>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Additional medical information or notes
              </label>
              <textarea
                name="medical_notes"
                value={formData.medical_notes}
                onChange={handleInputChange}
                placeholder="Any medical conditions, medications, or other health information your nutritionist should know..."
                rows={4}
                disabled={!editing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors hover:border-gray-400 disabled:bg-gray-50 resize-none"
              />
            </div>
          </div>
        </form>
      </div>

      {/* Profile Summary */}
      {profile && !editing && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Name:</span>
              <p className="font-medium">{profile.first_name} {profile.last_name}</p>
            </div>
            <div>
              <span className="text-gray-600">Age:</span>
              <p className="font-medium">
                {profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : 'N/A'} years
              </p>
            </div>
            <div>
              <span className="text-gray-600">Height:</span>
              <p className="font-medium">{profile.height_cm} cm</p>
            </div>
            <div>
              <span className="text-gray-600">Starting Weight:</span>
              <p className="font-medium">{profile.start_weight_kg} kg</p>
            </div>
            <div>
              <span className="text-gray-600">Dietary Preferences:</span>
              <p className="font-medium">
                {profile.dietary_prefs?.length > 0 
                  ? profile.dietary_prefs.map(pref => pref.replace('_', ' ')).join(', ')
                  : 'None specified'
                }
              </p>
            </div>
            <div>
              <span className="text-gray-600">Allergies:</span>
              <p className="font-medium">
                {profile.allergies?.length > 0 
                  ? profile.allergies.join(', ')
                  : 'None listed'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 