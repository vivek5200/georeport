"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import MapComponent from "../../components/MapComponent"
import { Users, ClipboardList, TrendingUp, Clock, CheckCircle, UserCheck, Bell } from "lucide-react"

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/admin`)
      setDashboardData(response.data.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const reportStats = dashboardData?.reportStats || {}
  const heatmapData = dashboardData?.heatmapData || []
  const authorityPerformance = dashboardData?.authorityPerformance || []

  // Convert heatmap data to reports format for map
  const mapReports = heatmapData.map((item, index) => ({
    _id: index,
    location: { coordinates: item.location },
    category: item.category,
    status: "verified",
    title: `${item.category} hotspot`,
    description: "High activity area",
    severity: Math.min(item.weight || 1, 5),
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management</p>
        </div>
        <div className="flex space-x-4">
          <Link to="/admin/requests" className="btn-secondary flex items-center space-x-2">
            <UserCheck className="h-5 w-5" />
            <span>Authority Requests</span>
          </Link>
          <Link to="/announcements/create" className="btn-primary flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Create Announcement</span>
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reportStats.total || 0}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {reportStats.byStatus?.find((s) => s._id === "resolved")?.count || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Resolution</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(reportStats.avgResolutionHours || 0)}h</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Authorities</p>
              <p className="text-2xl font-bold text-gray-900">{authorityPerformance.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Status Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {reportStats.byStatus?.map((status) => {
            const getStatusColor = (statusName) => {
              switch (statusName) {
                case "pending":
                  return "text-yellow-600 bg-yellow-100"
                case "verified":
                  return "text-blue-600 bg-blue-100"
                case "in_progress":
                  return "text-orange-600 bg-orange-100"
                case "resolved":
                  return "text-green-600 bg-green-100"
                case "rejected":
                  return "text-red-600 bg-red-100"
                default:
                  return "text-gray-600 bg-gray-100"
              }
            }

            return (
              <div key={status._id} className="text-center p-4 rounded-lg border">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-2 ${getStatusColor(status._id)}`}
                >
                  <span className="text-lg font-bold">{status.count}</span>
                </div>
                <p className="text-sm font-medium text-gray-900 capitalize">{status._id.replace("_", " ")}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Map and Authority Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports Heatmap</h3>
          <MapComponent
            center={[77.209, 28.6139]} // Default center
            zoom={10}
            reports={mapReports}
            height="400px"
          />
        </div>

        {/* Authority Performance */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Authority Performance</h3>
          <div className="space-y-4">
            {authorityPerformance.slice(0, 5).map((authority) => (
              <div key={authority._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{authority.name}</h4>
                  <p className="text-sm text-gray-600">
                    {authority.totalReports} reports • {authority.resolved} resolved
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {authority.totalReports > 0 ? Math.round((authority.resolved / authority.totalReports) * 100) : 0}%
                    resolved
                  </p>
                  <p className="text-xs text-gray-500">Avg: {Math.round(authority.resolutionRate || 0)}h</p>
                </div>
              </div>
            ))}
            {authorityPerformance.length === 0 && (
              <p className="text-gray-500 text-center py-8">No authority data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/admin/requests"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <UserCheck className="h-8 w-8 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900">Authority Requests</h4>
                <p className="text-sm text-gray-600">Review pending requests</p>
              </div>
            </div>
          </Link>

          <Link to="/reports" className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center space-x-3">
              <ClipboardList className="h-8 w-8 text-green-600" />
              <div>
                <h4 className="font-medium text-gray-900">All Reports</h4>
                <p className="text-sm text-gray-600">Monitor system reports</p>
              </div>
            </div>
          </Link>

          <Link
            to="/announcements"
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Bell className="h-8 w-8 text-purple-600" />
              <div>
                <h4 className="font-medium text-gray-900">Announcements</h4>
                <p className="text-sm text-gray-600">Manage announcements</p>
              </div>
            </div>
          </Link>

          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <h4 className="font-medium text-gray-900">Analytics</h4>
                <p className="text-sm text-gray-600">System insights</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
