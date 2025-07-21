const mongoose = require('mongoose');

const geojsonSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  }
}, { _id: false }); // prevent nested _id creation

module.exports = geojsonSchema;