// utils/geospatial.js
const Report = require('../models/Report');
const User = require('../models/User');
const { ErrorResponse } = require('./errorResponse');

/**
 * @namespace GeospatialUtils
 * @description Collection of geospatial query utilities
 */
module.exports = {
  /**
   * @desc Find duplicate reports within a radius
   * @param {number[]} coordinates - [longitude, latitude]
   * @param {string} category - Report category
   * @param {number} [maxDistance=50] - Distance in meters
   * @returns {Promise<Report|null>} - Duplicate report or null
   */
  async findNearbyDuplicateReports(coordinates, category, maxDistance = 50) {
    return Report.findOne({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates
          },
          $maxDistance: maxDistance
        }
      },
      category,
      status: { $ne: 'resolved' }
    });
  },

  /**
   * @desc Find authorities responsible for a location
   * @param {number[]} coordinates - [longitude, latitude]
   * @returns {Promise<User[]>} - Array of authority users
   */
  async findResponsibleAuthorities(coordinates) {
    return User.find({
      role: 'authority',
      assignedRegion: {
        $geoIntersects: {
          $geometry: {
            type: "Point",
            coordinates
          }
        }
      }
    });
  },

  /**
   * @desc Find reports within a radius
   * @param {number[]} coordinates - [longitude, latitude]
   * @param {number} maxDistance - Distance in meters
   * @param {Object} [filters={}] - Additional filters
   * @returns {Promise<Report[]>} - Array of reports
   */
  async findReportsNearLocation(coordinates, maxDistance, filters = {}) {
    return Report.find({
      ...filters,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates
          },
          $maxDistance: maxDistance
        }
      }
    });
  },

  /**
   * @desc Calculate distance between two points (Haversine formula)
   * @param {number[]} coords1 - [lon1, lat1]
   * @param {number[]} coords2 - [lon2, lat2]
   * @returns {number} - Distance in meters
   */
  calculateDistance(coords1, coords2) {
    const [lon1, lat1] = coords1;
    const [lon2, lat2] = coords2;
    
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  },

  /**
   * @desc Validate GeoJSON coordinates
   * @param {number[]} coordinates - [longitude, latitude]
   * @throws {ErrorResponse} - If coordinates are invalid
   */
  validateCoordinates(coordinates) {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      throw new ErrorResponse('Invalid coordinates format. Expected [longitude, latitude]', 400);
    }

    const [lon, lat] = coordinates;
    
    if (typeof lon !== 'number' || typeof lat !== 'number') {
      throw new ErrorResponse('Coordinates must be numbers', 400);
    }

    if (lon < -180 || lon > 180 || lat < -90 || lat > 90) {
      throw new ErrorResponse('Invalid coordinate values. Longitude must be [-180,180] and latitude [-90,90]', 400);
    }
  },

  /**
   * @desc Create a GeoJSON point
   * @param {number[]} coordinates - [longitude, latitude]
   * @returns {Object} - GeoJSON point
   */
  createGeoPoint(coordinates) {
    this.validateCoordinates(coordinates);
    return {
      type: "Point",
      coordinates
    };
  },

  /**
   * @desc Create a GeoJSON polygon
   * @param {number[][][]} coordinates - Array of coordinate rings
   * @returns {Object} - GeoJSON polygon
   */
  createGeoPolygon(coordinates) {
    if (!Array.isArray(coordinates)) {
      throw new ErrorResponse('Polygon coordinates must be an array', 400);
    }

    coordinates.forEach(ring => {
      ring.forEach(point => this.validateCoordinates(point));
    });

    return {
      type: "Polygon",
      coordinates
    };
  }
};