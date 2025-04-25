const mongoose = require('mongoose');


// Parent Schema
const paletteSchema = new mongoose.Schema({
    template_id: {
      type: Number,
      required: true,
      unique: true, // Ensure each template_id is unique
      sparse:true
    }
  }, { timestamps: true });

const Palette = mongoose.model('Palette', paletteSchema);

module.exports = Palette;