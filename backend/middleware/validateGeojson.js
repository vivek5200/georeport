const validateCoordinates = (coordinates) => {
  if (!Array.isArray(coordinates)) return false;
  return coordinates.every(coord => 
    typeof coord[0] === 'number' && 
    typeof coord[1] === 'number'
  );
};

module.exports = (req, res, next) => {
  if (req.body.location && !validateCoordinates(req.body.location.coordinates)) {
    return res.status(400).json({ error: 'Invalid coordinates format' });
  }
  next();
};