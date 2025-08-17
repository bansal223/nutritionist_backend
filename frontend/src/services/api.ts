import axios from 'axios'

const API_BASE_URL = 'http://localhost:8001/api/v1'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          })
          
          localStorage.setItem('access_token', response.data.access_token)
          localStorage.setItem('refresh_token', response.data.refresh_token)
          
          originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const formData = new FormData()
    formData.append('username', email)
    formData.append('password', password)
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
    return response.data
  },

  signup: async (userData: any) => {
    const response = await api.post('/auth/signup', userData)
    return response.data
  },

  getCurrentUser: async () => {
    console.log('Calling getCurrentUser API...')
    try {
      const response = await api.get('/auth/me')
      console.log('getCurrentUser response:', response.data)
      return response.data
    } catch (error) {
      console.error('getCurrentUser error:', error)
      throw error
    }
  },

  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', { refresh_token: refreshToken })
    return response.data
  },
}

// Users API
export const usersApi = {
  updateProfile: async (userData: any) => {
    const response = await api.put('/users/me', userData)
    return response.data
  },
}

// Patients API
export const patientsApi = {
  getProfile: async () => {
    console.log('Calling patientsApi.getProfile...')
    try {
      const response = await api.get('/patients/profile')
      console.log('patientsApi.getProfile response:', response.data)
      return response.data
    } catch (error) {
      console.error('patientsApi.getProfile error:', error)
      throw error
    }
  },

  updateProfile: async (profileData: any) => {
    const response = await api.put('/patients/profile', profileData)
    return response.data
  },

  getCurrentMealPlan: async () => {
    console.log('Calling patientsApi.getCurrentMealPlan...')
    try {
      const response = await api.get('/patients/current-plan')
      console.log('patientsApi.getCurrentMealPlan response:', response.data)
      return response.data
    } catch (error) {
      console.error('patientsApi.getCurrentMealPlan error:', error)
      throw error
    }
  },

  createProgressReport: async (progressData: any) => {
    const response = await api.post('/patients/progress', progressData)
    return response.data
  },

  getProgressReports: async (limit = 10, skip = 0) => {
    const response = await api.get(`/patients/progress?limit=${limit}&skip=${skip}`)
    return response.data
  },
}

// Nutritionists API
export const nutritionistsApi = {
  getProfile: async () => {
    const response = await api.get('/nutritionists/profile')
    return response.data
  },

  getPatients: async (limit = 20, skip = 0) => {
    console.log('Calling nutritionistsApi.getPatients...')
    try {
      const response = await api.get(`/nutritionists/patients?limit=${limit}&skip=${skip}`)
      console.log('nutritionistsApi.getPatients response:', response.data)
      return response.data
    } catch (error) {
      console.error('nutritionistsApi.getPatients error:', error)
      throw error
    }
  },

  getPatientProgress: async (patientId: string, limit = 10, skip = 0) => {
    const response = await api.get(`/nutritionists/patients/${patientId}/progress?limit=${limit}&skip=${skip}`)
    return response.data
  },
}

// Meal Plans API
export const mealPlansApi = {
  create: async (mealPlanData: any) => {
    const response = await api.post('/meal-plans', mealPlanData)
    return response.data
  },

  update: async (mealPlanId: string, mealPlanData: any) => {
    const response = await api.put(`/meal-plans/${mealPlanId}`, mealPlanData)
    return response.data
  },

  getAll: async (patientId?: string, limit = 20, skip = 0) => {
    console.log('Calling mealPlansApi.getAll...')
    try {
      const params = new URLSearchParams()
      if (patientId) params.append('patient_id', patientId)
      params.append('limit', limit.toString())
      params.append('skip', skip.toString())
      
      const response = await api.get(`/meal-plans?${params}`)
      console.log('mealPlansApi.getAll response:', response.data)
      return response.data
    } catch (error) {
      console.error('mealPlansApi.getAll error:', error)
      throw error
    }
  },

  getById: async (mealPlanId: string) => {
    const response = await api.get(`/meal-plans/${mealPlanId}`)
    return response.data
  },
}

// Progress API
export const progressApi = {
  getReports: async (patientId?: string, limit = 10, skip = 0) => {
    console.log('Calling progressApi.getReports...')
    try {
      const params = new URLSearchParams()
      if (patientId) params.append('patient_id', patientId)
      params.append('limit', limit.toString())
      params.append('skip', skip.toString())
      
      const response = await api.get(`/progress?${params}`)
      console.log('progressApi.getReports response:', response.data)
      return response.data
    } catch (error) {
      console.error('progressApi.getReports error:', error)
      throw error
    }
  },

  getSummary: async (patientId: string) => {
    const response = await api.get(`/progress/summary/${patientId}`)
    return response.data
  },
}

// Subscriptions API
export const subscriptionsApi = {
  createOrder: async (paymentData: any) => {
    const response = await api.post('/subscriptions/create-order', paymentData)
    return response.data
  },

  create: async (subscriptionData: any) => {
    const response = await api.post('/subscriptions', subscriptionData)
    return response.data
  },

  getAll: async (limit = 10, skip = 0) => {
    const response = await api.get(`/subscriptions?limit=${limit}&skip=${skip}`)
    return response.data
  },

  getCurrent: async () => {
    const response = await api.get('/subscriptions/current')
    return response.data
  },
}

// Assignments API
export const assignmentsApi = {
  create: async (assignmentData: any) => {
    console.log('Calling assignmentsApi.create...')
    try {
      const response = await api.post('/assignments', assignmentData)
      console.log('assignmentsApi.create response:', response.data)
      return response.data
    } catch (error) {
      console.error('assignmentsApi.create error:', error)
      throw error
    }
  },

  getAll: async (patientId?: string, nutritionistId?: string, active?: boolean, limit = 20, skip = 0) => {
    console.log('Calling assignmentsApi.getAll...')
    try {
      const params = new URLSearchParams()
      if (patientId) params.append('patient_id', patientId)
      if (nutritionistId) params.append('nutritionist_id', nutritionistId)
      if (active !== undefined) params.append('active', active.toString())
      params.append('limit', limit.toString())
      params.append('skip', skip.toString())
      
      const response = await api.get(`/assignments?${params}`)
      console.log('assignmentsApi.getAll response:', response.data)
      return response.data
    } catch (error) {
      console.error('assignmentsApi.getAll error:', error)
      throw error
    }
  },

  update: async (assignmentId: string, assignmentData: any) => {
    const response = await api.put(`/assignments/${assignmentId}`, assignmentData)
    return response.data
  },

  delete: async (assignmentId: string) => {
    const response = await api.delete(`/assignments/${assignmentId}`)
    return response.data
  },
}

// Admin API
export const adminApi = {
  getUsers: async (role?: string, status?: string, limit = 50, skip = 0) => {
    const params = new URLSearchParams()
    if (role) params.append('role', role)
    if (status) params.append('status', status)
    params.append('limit', limit.toString())
    params.append('skip', skip.toString())
    
    const response = await api.get(`/admin/users?${params}`)
    return response.data
  },

  updateUser: async (userId: string, userData: any) => {
    const response = await api.put(`/admin/users/${userId}`, userData)
    return response.data
  },

  verifyNutritionist: async (nutritionistId: string) => {
    const response = await api.post(`/admin/nutritionists/${nutritionistId}/verify`)
    return response.data
  },

  getMetrics: async () => {
    const response = await api.get('/admin/metrics')
    return response.data
  },

  getPendingNutritionists: async (limit = 20, skip = 0) => {
    const response = await api.get(`/admin/nutritionists/pending?limit=${limit}&skip=${skip}`)
    return response.data
  },
} 