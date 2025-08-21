import React, { useEffect, useState } from 'react'
import { patientsApi } from '../services/api'

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

export default function PatientProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
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
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    console.log('PatientProfile: Component mounted')
    
    const fetchProfile = async () => {
      try {
        console.log('PatientProfile: Fetching profile...')
        const profileData = await patientsApi.getProfile()
        console.log('PatientProfile: Profile data:', profileData)
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
        console.error('PatientProfile: Error fetching profile:', error)
        // Profile doesn't exist yet, show empty form
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      console.log('PatientProfile: Saving profile...')
      
      // Prepare data for API - convert date string to proper format and validate dietary preferences
      const apiData = {
        ...formData,
        dob: formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : null,
        dietary_prefs: validateDietaryPrefs(formData.dietary_prefs)
      }
      
      console.log('PatientProfile: Sending data to API:', apiData)
      console.log('PatientProfile: Form data before processing:', formData)
      
      let savedProfile
      if (profile) {
        // Update existing profile
        savedProfile = await patientsApi.updateProfile(apiData)
      } else {
        // Create new profile
        savedProfile = await patientsApi.createProfile(apiData)
      }
      
      console.log('PatientProfile: Saved profile:', savedProfile)
      setProfile(savedProfile)
      setEditing(false)
      alert('Profile saved successfully!')
    } catch (error: any) {
      console.error('PatientProfile: Error saving profile:', error)
      const errorMessage = error.response?.data?.detail || 'Error saving profile. Please try again.'
      alert(errorMessage)
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
  }

  const handleArrayChange = (field: 'allergies' | 'dietary_prefs', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(item => item.trim()).filter(item => item)
    }))
  }

  // Validate dietary preferences against allowed values
  const validateDietaryPrefs = (prefs: string[]) => {
    const allowedPrefs = ['veg', 'non_veg', 'vegan', 'keto', 'paleo']
    return prefs.filter(pref => allowedPrefs.includes(pref.toLowerCase())).map(pref => pref.toLowerCase())
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      {!profile && !editing ? (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Create Your Profile</h2>
          <p className="text-gray-600 mb-4">
            Please create your profile to help your nutritionist provide better care.
          </p>
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Create Profile
          </button>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  disabled={!editing}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  disabled={!editing}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  disabled={!editing}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  disabled={!editing}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height_cm"
                  value={formData.height_cm}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  min="50"
                  max="300"
                  disabled={!editing}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Starting Weight (kg)
                </label>
                <input
                  type="number"
                  name="start_weight_kg"
                  value={formData.start_weight_kg}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                  min="20"
                  max="500"
                  step="0.1"
                  disabled={!editing}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allergies (comma-separated)
              </label>
              <input
                type="text"
                value={formData.allergies.join(', ')}
                onChange={(e) => handleArrayChange('allergies', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., nuts, dairy, shellfish"
                disabled={!editing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dietary Preferences (comma-separated)
              </label>
              <input
                type="text"
                value={formData.dietary_prefs.join(', ')}
                onChange={(e) => handleArrayChange('dietary_prefs', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                placeholder="e.g., vegetarian, vegan, gluten-free"
                disabled={!editing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical Notes
              </label>
              <textarea
                name="medical_notes"
                value={formData.medical_notes}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                rows={3}
                placeholder="Any medical conditions or notes for your nutritionist"
                disabled={!editing}
              />
            </div>

            {editing && (
              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    // Reset form data to original profile
                    if (profile) {
                      setFormData({
                        first_name: profile.first_name || '',
                        last_name: profile.last_name || '',
                        dob: profile.dob ? new Date(profile.dob).toISOString().split('T')[0] : '',
                        height_cm: profile.height_cm || 0,
                        start_weight_kg: profile.start_weight_kg || 0,
                        gender: profile.gender || 'male',
                        allergies: profile.allergies || [],
                        dietary_prefs: profile.dietary_prefs || [],
                        medical_notes: profile.medical_notes || ''
                      })
                    }
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  )
} 