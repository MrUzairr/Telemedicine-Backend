const mongoose = require('mongoose');

// Updated Schema without the unique constraint on template_id
const paletteDetailSchema = new mongoose.Schema({
  template_id: {
    type: Number,  // Store template_id here
    required: true,
    ref: 'Palette' // Reference to the Palette model
  },
  details: [
    {
      label: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      }
    }
  ]
}, { timestamps: true });

// Create PaletteDetail model
const PaletteDetail = mongoose.model('PaletteDetail', paletteDetailSchema);

module.exports = PaletteDetail;
