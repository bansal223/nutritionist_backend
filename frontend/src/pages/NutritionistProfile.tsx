import React, { useEffect, useState } from 'react'
import { nutritionistsApi } from '../services/api'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Calendar, 
  DollarSign, 
  Star, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Clock,
  BookOpen,
  Shield,
  Heart
} from 'lucide-react'

interface NutritionistProfile {
  id: string
  user_id: string
  registration_no: string
  qualifications: string
  years_experience: number
  bio: string
  rate_week_inr: number
  verified: boolean
}

interface Stats {
  totalPatients: number
  activePatients: number
  totalMealPlans: number
  averageRating: number
  completionRate: number
}

export default function NutritionistProfile() {
  const [profile, setProfile] = useState<NutritionistProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    activePatients: 0,
    totalMealPlans: 0,
    averageRating: 4.8,
    completionRate: 92
  })

  const [formData, setFormData] = useState({
    registration_no: '',
    qualifications: '',
    years_experience: 0,
    bio: '',
    rate_week_inr: 0
  })

  useEffect(() => {
    console.log('NutritionistProfile: Component mounted')
    
    const fetchProfile = async () => {
      try {
        console.log('NutritionistProfile: Fetching profile...')
        const profileData = await nutritionistsApi.getProfile()
        console.log('NutritionistProfile: Profile data:', profileData)
        setProfile(profileData)
        setFormData({
          registration_no: profileData.registration_no || '',
          qualifications: profileData.qualifications || '',
          years_experience: profileData.years_experience || 0,
          bio: profileData.bio || '',
          rate_week_inr: profileData.rate_week_inr || 0
        })
        
        // Fetch stats (mock data for now)
        setStats({
          totalPatients: 15,
          activePatients: 12,
          totalMealPlans: 47,
          averageRating: 4.8,
          completionRate: 92
        })
      } catch (error) {
        console.error('NutritionistProfile: Error fetching profile:', error)
        setError('Failed to load profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      console.log('NutritionistProfile: Saving profile...')
      const updatedProfile = await nutritionistsApi.updateProfile(formData)
      console.log('NutritionistProfile: Updated profile:', updatedProfile)
      setProfile(updatedProfile)
      setEditing(false)
      setSuccess('Profile updated successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (error: any) {
      console.error('NutritionistProfile: Error saving profile:', error)
      const errorMessage = error.response?.data?.detail || 'Error saving profile. Please try again.'
      setError(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'years_experience' || name === 'rate_week_inr' 
        ? parseFloat(value) || 0 
        : value
    }))
  }

  const handleCancel = () => {
    setEditing(false)
    setError('')
    // Reset form data to original values
    if (profile) {
      setFormData({
        registration_no: profile.registration_no || '',
        qualifications: profile.qualifications || '',
        years_experience: profile.years_experience || 0,
        bio: profile.bio || '',
        rate_week_inr: profile.rate_week_inr || 0
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your professional information and credentials</p>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Edit3 size={16} />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="success-message">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700 text-sm font-medium">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="card">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Dr. {profile?.registration_no || 'Nutritionist'}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    {profile?.verified ? (
                      <div className="flex items-center space-x-1 text-green-600">
                        <Shield size={16} />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-orange-600">
                        <AlertCircle size={16} />
                        <span className="text-sm font-medium">Pending Verification</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <Star size={16} />
                      <span className="text-sm font-medium">{stats.averageRating}</span>
                    </div>
                  </div>
                </div>
              </div>
              {editing && (
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    form="profile-form"
                    disabled={saving}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>

            <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Award className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="registration_no"
                      value={formData.registration_no}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter registration number"
                      disabled={!editing}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Years of Experience
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="years_experience"
                      value={formData.years_experience}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Years of experience"
                      min="0"
                      max="50"
                      disabled={!editing}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualifications
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                    <BookOpen className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your qualifications and certifications"
                    disabled={!editing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekly Rate (INR)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="rate_week_inr"
                    value={formData.rate_week_inr}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Weekly rate in INR"
                    min="0"
                    disabled={!editing}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 pt-3 pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Tell patients about your approach, specialties, and what makes you unique..."
                    disabled={!editing}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Specializations */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Specializations</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['Weight Management', 'Sports Nutrition', 'Diabetes Care', 'Pregnancy Nutrition', 'Pediatric Nutrition', 'Elderly Care'].map((spec) => (
                <div key={spec} className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">{spec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Patients</p>
                    <p className="text-lg font-bold text-gray-900">{stats.totalPatients}</p>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <Heart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Patients</p>
                    <p className="text-lg font-bold text-gray-900">{stats.activePatients}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600 font-medium">
                    {Math.round((stats.activePatients / stats.totalPatients) * 100)}%
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Meal Plans</p>
                    <p className="text-lg font-bold text-gray-900">{stats.totalMealPlans}</p>
                  </div>
                </div>
                <Clock className="w-5 h-5 text-purple-600" />
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="text-lg font-bold text-gray-900">{stats.averageRating}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className={star <= Math.floor(stats.averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300'}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Verification Status */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Status</h3>
            {profile?.verified ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">Verified Professional</span>
                </div>
                <p className="text-green-700 text-sm mt-2">
                  Your profile has been verified. Patients can trust your credentials.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span className="text-orange-800 font-medium">Pending Verification</span>
                </div>
                <p className="text-orange-700 text-sm mt-2">
                  Your profile is under review. This usually takes 2-3 business days.
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full btn-primary flex items-center justify-center space-x-2">
                <Camera size={16} />
                <span>Update Photo</span>
              </button>
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <BookOpen size={16} />
                <span>View Certificates</span>
              </button>
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <TrendingUp size={16} />
                <span>View Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 