"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import MapComponent from "../../components/MapComponent"
import { Plus, MapPin, AlertCircle, CheckCircle, Clock, Bell, FileText } from "lucide-react"

function CitizenDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState([77.209, 28.6139]) // Default to Delhi

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.longitude, position.coords.latitude]
          setUserLocation(coords)
          fetchDashboardData(coords)
        },
        (error) => {
          console.error("Error getting location:", error)
          fetchDashboardData(userLocation)
        },
      )
    } else {
      fetchDashboardData(userLocation)
    }
  }, [])

  const fetchDashboardData = async (coordinates) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/analytics/citizen?coordinates=${coordinates.join(",")}`,
      )
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
          <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const StatCard = ({ icon: Icon, title, value, color, bgColor, description }) => (
    <div className="card card-hover">
      <div className="flex items-center">
        <div className={`p-3 ${bgColor} rounded-xl`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
          {description && <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{description}</p>}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Welcome back! 👋</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage your reports from your personalized dashboard
          </p>
        </div>
        <Link to="/reports/create" className="btn-primary flex items-center space-x-2 shadow-lg">
          <Plus className="h-5 w-5" />
          <span>Create Report</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          title="My Reports"
          value={dashboardData?.myReports?.length || 0}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-100 dark:bg-blue-900/30"
          description="Total reports submitted"
        />
        <StatCard
          icon={Clock}
          title="Pending"
          value={dashboardData?.myReports?.filter((r) => r.status === "pending").length || 0}
          color="text-yellow-600 dark:text-yellow-400"
          bgColor="bg-yellow-100 dark:bg-yellow-900/30"
          description="Awaiting review"
        />
        <StatCard
          icon={CheckCircle}
          title="Resolved"
          value={dashboardData?.myReports?.filter((r) => r.status === "resolved").length || 0}
          color="text-green-600 dark:text-green-400"
          bgColor="bg-green-100 dark:bg-green-900/30"
          description="Successfully completed"
        />
        <StatCard
          icon={AlertCircle}
          title="Nearby Issues"
          value={dashboardData?.nearbyReports?.length || 0}
          color="text-red-600 dark:text-red-400"
          bgColor="bg-red-100 dark:bg-red-900/30"
          description="In your area"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Interactive Map */}
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Nearby Reports</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <MapPin className="h-4 w-4" />
              <span>Live Map</span>
            </div>
          </div>
          <MapComponent center={userLocation} zoom={13} reports={dashboardData?.nearbyReports || []} height="400px" />
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              📍 Red pins show active reports in your area. Click on any pin to view details.
            </p>
          </div>
        </div>

        {/* My Recent Reports */}
        <div className="card card-hover">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">My Recent Reports</h3>
            <Link
              to="/reports"
              className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
            >
              View All →
            </Link>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {dashboardData?.myReports?.slice(0, 5).map((report) => (
              <div
                key={report._id}
                className="border-l-4 border-primary-500 pl-4 py-3 bg-gray-50 dark:bg-dark-700/50 rounded-r-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors duration-200"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{report.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {new Date(report.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
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
                </div>
                <Link
                  to={`/reports/${report._id}`}
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
                >
                  View Details →
                </Link>
              </div>
            ))}

            {(!dashboardData?.myReports || dashboardData.myReports.length === 0) && (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  No reports yet. Create your first report to get started!
                </p>
                <Link to="/reports/create" className="btn-primary">
                  Create Report
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Announcements Section */}
      <div className="card card-hover">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Bell className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Announcements</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Important updates from authorities</p>
          </div>
        </div>

        <div className="space-y-4">
          {dashboardData?.announcements?.map((announcement) => (
            <div
              key={announcement._id}
              className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800/50 rounded-xl p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Bell className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">{announcement.title}</h4>
                  <p className="text-blue-800 dark:text-blue-200 text-sm mb-2">{announcement.message}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {new Date(announcement.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {(!dashboardData?.announcements || dashboardData.announcements.length === 0) && (
            <div className="text-center py-8">
              <Bell className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No announcements available</p>
            </div>
          )}
        </div>

        {dashboardData?.announcements && dashboardData.announcements.length > 0 && (
          <div className="mt-6 text-center">
            <Link to="/announcements" className="btn-secondary inline-flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>View All Announcements</span>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/reports/create" className="card card-hover group">
          <div className="text-center py-6">
            <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-2xl w-fit mx-auto mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors duration-200">
              <Plus className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Create New Report</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Report a new issue in your area</p>
          </div>
        </Link>

        <Link to="/reports" className="card card-hover group">
          <div className="text-center py-6">
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-2xl w-fit mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors duration-200">
              <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">View All Reports</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Browse and track your reports</p>
          </div>
        </Link>

        <Link to="/announcements" className="card card-hover group">
          <div className="text-center py-6">
            <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-2xl w-fit mx-auto mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors duration-200">
              <Bell className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Announcements</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Stay updated with official news</p>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default CitizenDashboard
