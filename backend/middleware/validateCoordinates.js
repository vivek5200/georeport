const { ErrorResponse } = require('../utils/errorResponse');

const validateCoordinates = (req, res, next) => {
  try {
    // Check if coordinates parameter exists
    if (!req.query.coordinates) {
      return next(new ErrorResponse('Coordinates parameter is required (format: lng,lat)', 400));
    }

    // Parse coordinates
    const coords = req.query.coordinates.split(',').map(Number);
    
    // Validate format
    if (coords.length !== 2 || coords.some(isNaN)) {
      return next(new ErrorResponse('Coordinates must be in "lng,lat" number format', 400));
    }

    // Validate ranges
    const [lng, lat] = coords;
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      return next(new ErrorResponse('Coordinates out of bounds (longitude: -180 to 180, latitude: -90 to 90)', 400));
    }

    // Attach validated coordinates to request
    req.validCoordinates = coords;
    next();
  } catch (err) {
    next(new ErrorResponse('Invalid coordinates format', 400));
  }
};

module.exports = validateCoordinates;