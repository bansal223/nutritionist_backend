export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">User Management</h3>
          <p className="text-gray-600">Manage all platform users</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Nutritionist Verification</h3>
          <p className="text-gray-600">Review and verify nutritionists</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Platform Metrics</h3>
          <p className="text-gray-600">View analytics and insights</p>
        </div>
      </div>
    </div>
  )
} 