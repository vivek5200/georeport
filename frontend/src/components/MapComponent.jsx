"use client"

import { useEffect, useRef, useState } from "react"
import { Map, View } from "ol"
import TileLayer from "ol/layer/Tile"
import OSM from "ol/source/OSM"
import VectorLayer from "ol/layer/Vector"
import VectorSource from "ol/source/Vector"
import Feature from "ol/Feature"
import Point from "ol/geom/Point"
import { Style, Circle, Fill, Stroke, Text } from "ol/style"
import { fromLonLat, toLonLat } from "ol/proj"
import Overlay from "ol/Overlay"
import { X, Navigation, Info, MapPin } from "lucide-react"
import { debounce } from "lodash"

function MapComponent({
  center = [0, 0],
  zoom = 2,
  onLocationSelect,
  reports = [],
  height = "400px",
  showLocationPicker = false,
  showDrawingTools = false,
  onDrawingComplete,
}) {
  const mapRef = useRef()
  const mapInstanceRef = useRef()
  const popupRef = useRef()
  const [selectedReport, setSelectedReport] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [drawingMode, setDrawingMode] = useState(false)
  const [drawnFeatures, setDrawnFeatures] = useState([])
  const vectorSourceRef = useRef(new VectorSource())
  const drawSourceRef = useRef(new VectorSource())

  useEffect(() => {
    if (!mapInstanceRef.current) {
      // Initialize map
      const map = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
          new VectorLayer({
            source: vectorSourceRef.current,
            name: "reports",
          }),
          new VectorLayer({
            source: drawSourceRef.current,
            name: "drawings",
          }),
        ],
        view: new View({
          center: fromLonLat(center),
          zoom: zoom,
        }),
      })

      // Create popup overlay
      const popup = new Overlay({
        element: popupRef.current,
        positioning: "bottom-center",
        stopEvent: false,
        offset: [0, -50],
      })
      map.addOverlay(popup)

      mapInstanceRef.current = map

      // Add click handler for location selection
      if (showLocationPicker && onLocationSelect) {
        setupLocationPicker(map)
      }

      // Add reports layer
      if (reports.length > 0) {
        setupReportsLayer(map, popup)
      }

      // Handle map view changes
      map.getView().on('change:resolution', debounce(() => {
        adjustMarkerSizes(map)
      }, 100))
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setTarget(null)
        mapInstanceRef.current = null
      }
    }
  }, [center, zoom])

  useEffect(() => {
    if (mapInstanceRef.current && reports.length > 0) {
      updateReportsLayer()
    }
  }, [reports])

  const setupLocationPicker = (map) => {
    map.on("click", (event) => {
      if (drawingMode) return
      
      const coordinate = toLonLat(event.coordinate)
      setSelectedLocation(coordinate)
      onLocationSelect?.(coordinate)

      // Add a marker for selected location
      const feature = new Feature({
        geometry: new Point(event.coordinate),
      })

      feature.setStyle(
        new Style({
          image: new Circle({
            radius: 8,
            fill: new Fill({
              color: "#ef4444", // Red color
            }),
            stroke: new Stroke({
              color: "#ffffff",
              width: 3,
            }),
          }),
        }),
      )

      // Clear previous location features
      vectorSourceRef.current.clear()
      vectorSourceRef.current.addFeature(feature)
    })
  }

  const setupReportsLayer = (map, popup) => {
    updateReportsLayer()

    // Add click handler for report popups
    map.on("click", (event) => {
      if (drawingMode) return
      
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature)
      if (feature && feature.get("report")) {
        const report = feature.get("report")
        setSelectedReport(report)
        popup.setPosition(event.coordinate)
      } else if (!showLocationPicker) {
        popup.setPosition(undefined)
        setSelectedReport(null)
      }
    })

    // Change cursor on hover
    map.on("pointermove", (event) => {
      const feature = map.forEachFeatureAtPixel(event.pixel, (feature) => feature)
      map.getTargetElement().style.cursor = feature ? "pointer" : ""
    })
  }

  const updateReportsLayer = () => {
    vectorSourceRef.current.clear()
    
    reports.forEach((report) => {
      if (report.location?.coordinates) {
        const feature = new Feature({
          geometry: new Point(fromLonLat(report.location.coordinates)),
          report: report,
        })

        feature.setStyle(createReportStyle(report))
        vectorSourceRef.current.addFeature(feature)
      }
    })
  }

  const createReportStyle = (report) => {
    const statusColor = getStatusColor(report.status)
    
    return new Style({
      image: new Circle({
        radius: 8,
        fill: new Fill({
          color: statusColor,
        }),
        stroke: new Stroke({
          color: "#ffffff",
          width: 2,
        }),
      }),
      text: new Text({
        text: "📍",
        font: "bold 16px sans-serif",
        offsetY: -20,
        fill: new Fill({ color: statusColor }),
        stroke: new Stroke({
          color: "#ffffff",
          width: 2,
        }),
      }),
    })
  }

  const adjustMarkerSizes = (map) => {
    const resolution = map.getView().getResolution()
    const zoom = map.getView().getZoom()
    const scaleFactor = Math.max(0.5, Math.min(1.5, zoom / 10))
    
    vectorSourceRef.current.getFeatures().forEach(feature => {
      const style = feature.getStyle()
      if (style) {
        const image = style.getImage()
        if (image) {
          image.setRadius(8 * scaleFactor)
        }
      }
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "#fbbf24" // Yellow
      case "verified": return "#3b82f6" // Blue
      case "in_progress": return "#f59e0b" // Orange
      case "resolved": return "#10b981" // Green
      case "rejected": return "#ef4444" // Red
      default: return "#6b7280" // Gray
    }
  }

  const enableDrawing = () => {
    if (!mapInstanceRef.current) return
    
    setDrawingMode(true)
    drawSourceRef.current.clear()
    
    // Implement drawing logic here
    // For example using ol-draw or similar
    // This is a placeholder for the drawing functionality
    console.log("Drawing mode enabled")
    
    // When drawing is complete:
    // onDrawingComplete?.(coordinates)
  }

  const clearDrawings = () => {
    drawSourceRef.current.clear()
    setDrawingMode(false)
  }

  const closePopup = () => {
    if (mapInstanceRef.current) {
      const overlays = mapInstanceRef.current.getOverlays()
      overlays.getArray()[0].setPosition(undefined)
    }
    setSelectedReport(null)
  }

  const flyToLocation = (coordinates) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.getView().animate({
        center: fromLonLat(coordinates),
        zoom: 15,
        duration: 1000,
      })
    }
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        style={{ height }}
        className="w-full rounded-xl border border-gray-200 shadow-lg overflow-hidden"
      />

      {/* Enhanced Popup */}
      <div ref={popupRef} className="ol-popup bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-xs">
        {selectedReport && (
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                {selectedReport.title}
              </h3>
              <button
                onClick={closePopup}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
              {selectedReport.description}
            </p>

            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                selectedReport.category === 'infrastructure' ? 'bg-blue-100 text-blue-800' :
                selectedReport.category === 'environment' ? 'bg-green-100 text-green-800' :
                selectedReport.category === 'safety' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {selectedReport.category}
              </span>
              
              <span className={`px-2 py-1 rounded-full text-xs ${
                selectedReport.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                selectedReport.status === 'verified' ? 'bg-blue-100 text-blue-800' :
                selectedReport.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                selectedReport.status === 'resolved' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {selectedReport.status.replace('_', ' ')}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{new Date(selectedReport.createdAt).toLocaleDateString()}</span>
              </div>
              <button 
                onClick={() => flyToLocation(selectedReport.location.coordinates)}
                className="text-xs flex items-center text-primary-600 dark:text-primary-400 hover:underline"
              >
                <MapPin className="h-3 w-3 mr-1" />
                View on map
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Location Picker Instructions */}
      {showLocationPicker && (
        <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg max-w-xs border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
              <Navigation className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Select Location</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Click on the map to set your location</p>
            </div>
          </div>
          {selectedLocation && (
            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/10 rounded text-xs text-green-700 dark:text-green-300">
              <span className="font-medium">Selected:</span> {selectedLocation[1].toFixed(6)}, {selectedLocation[0].toFixed(6)}
            </div>
          )}
        </div>
      )}

      {/* Drawing Tools */}
      {showDrawingTools && (
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <button
              onClick={enableDrawing}
              className={`p-2 rounded-md ${drawingMode ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              title="Draw region"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={clearDrawings}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Clear drawings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
          {drawingMode && (
            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/10 rounded text-xs text-blue-700 dark:text-blue-300">
              Drawing mode active - click to add points
            </div>
          )}
        </div>
      )}

      {/* Map Legend */}
      {reports.length > 0 && !showLocationPicker && (
        <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100">Report Status</h4>
          </div>
          <div className="space-y-2">
            {['pending', 'verified', 'in_progress', 'resolved', 'rejected'].map(status => (
              <div key={status} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getStatusColor(status) }}
                />
                <span className="text-xs text-gray-600 dark:text-gray-300 capitalize">
                  {status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default MapComponent