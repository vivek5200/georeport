"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import MapComponent from "../../components/MapComponent"
import {
  ClipboardList,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  Bell,
  BarChart3,
  MapPin,
} from "lucide-react"

function AuthorityDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/authority`)
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
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading authority dashboard...</p>
        </div>
      </div>
    )
  }

  const statusCounts = dashboardData?.stats?.statusCounts || []
  const categoryStats = dashboardData?.stats?.categoryStats || []
  const recentReports = dashboardData?.recentReports || []
  const heatmapData = dashboardData?.heatmapData || []

  // Convert heatmap data to reports format for map
  const mapReports = heatmapData.map((item, index) => ({
    _id: index,
    location: { coordinates: item.location },
    category: item.category,
    status: "in_progress",
    title: `${item.category} issue`,
    description: "Active issue in your area",
    severity: item.weight || 1,
    createdAt: new Date().toISOString(),
  }))

  const StatCard = ({ icon: Icon, title, value, color, bgColor, status }) => (
    <div className="card card-hover">
      <div className="flex items-center">
        <div className={`p-3 ${bgColor} rounded-xl`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
            {status?.replace("_", " ") || title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Authority Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage reports in your assigned area</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/announcements/create" className="btn-secondary flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Create Announcement</span>
          </Link>
          <Link to="/reports" className="btn-primary flex items-center space-x-2">
            <ClipboardList className="h-5 w-5" />
            <span>View Reports</span>
          </Link>
        </div>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusCounts.map((stat) => {
          const getStatusConfig = (status) => {
            switch (status) {
              case "pending":
                return {
                  icon: Clock,
                  color: "text-yellow-600 dark:text-yellow-400",
                  bgColor: "bg-yellow-100 dark:bg-yellow-900/30",
                }
              case "verified":
                return {
                  icon: AlertTriangle,
                  color: "text-blue-600 dark:text-blue-400",
                  bgColor: "bg-blue-100 dark:bg-blue-900/30",
                }
              case "in_progress":
                return {
                  icon: TrendingUp,
                  color: "text-orange-600 dark:text-orange-400",
                  bgColor: "bg-orange-100 dark:bg-orange-900/30",
                }
              case "resolved":
                return {
                  icon: CheckCircle,
                  color: "text-green-600 dark:text-green-400",
                  bgColor: "bg-green-100 dark:bg-green-900/30",
                }
              default:
                return {
                  icon: ClipboardList,
                  color: "text-gray-600 dark:text-gray-400",
                  bgColor: "bg-gray-100 dark:bg-gray-700/30",
                }
            }
          }

          const config = getStatusConfig(stat.status)
          return (
            <StatCard
              key={stat.status}
              icon={config.icon}
              value={stat.count}
              color={config.color}
              bgColor={config.bgColor}
              status={stat.status}
            />
          )
        })}
      </div>

      {/* Category Stats */}
      <div className="card card-hover">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Reports by Category</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Distribution of report types in your area</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categoryStats.map((category) => (
            <div
              key={category.category}
              className="text-center p-4 bg-gray-50 dark:bg-dark-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
            >
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-1">{category.count}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{category.category}</p>
            </div>
          ))}

          {categoryStats.length === 0 && (
            <div className="col-span-full text-center py-8">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No category data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Map and Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Issues Heatmap */}
        <div className="card card-hover">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <MapPin className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Active Issues Map</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Real-time view of ongoing issues</p>
            </div>
          </div>

          <MapComponent
            center={[77.209, 28.6139]} // Default center
            zoom={12}
            reports={mapReports}
            height="400px"
          />

          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-300">
              📍 Red pins indicate active issues requiring attention. Click to view details.
            </p>
          </div>
        </div>

        {/* High Priority Reports */}
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">High Priority Reports</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reports requiring immediate attention</p>
              </div>
            </div>
            <Link
              to="/reports?status=pending"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentReports.map((report) => (
              <div
                key={report._id}
                className="border-l-4 border-red-500 pl-4 py-3 bg-gray-50 dark:bg-dark-700/50 rounded-r-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{report.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span>Priority: {report.priorityScore}</span>
                      <span>By: {report.user?.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`status-badge ${
                        report.status === "resolved"
                          ? "status-resolved"
                          : report.status === "in_progress"
                            ? "status-in-progress"
                            : report.status === "verified"
                              ? "status-verified"
                              : "status-pending"
                      }`}
                    >
                      {report.status.replace("_", " ")}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Link
                  to={`/reports/${report._id}`}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                >
                  View Details →
                </Link>
              </div>
            ))}

            {recentReports.length === 0 && (
              <div className="text-center py-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No high priority reports</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card card-hover">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quick Actions</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Common tasks and workflows</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/reports?status=pending"
            className="p-6 border border-gray-200 dark:border-dark-600 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors duration-200">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Review Pending</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Check new reports</p>
              </div>
            </div>
          </Link>

          <Link
            to="/reports?status=in_progress"
            className="p-6 border border-gray-200 dark:border-dark-600 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors duration-200">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">In Progress</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Update ongoing work</p>
              </div>
            </div>
          </Link>

          <Link
            to="/announcements/create"
            className="p-6 border border-gray-200 dark:border-dark-600 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-all duration-200 group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-200">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Announce</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Inform citizens</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AuthorityDashboard
