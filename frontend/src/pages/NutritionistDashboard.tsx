export default function NutritionistDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nutritionist Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">My Patients</h3>
          <p className="text-gray-600">Manage your patient assignments</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Meal Plans</h3>
          <p className="text-gray-600">Create and manage meal plans</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Progress Reports</h3>
          <p className="text-gray-600">View patient progress</p>
        </div>
      </div>
    </div>
  )
} 