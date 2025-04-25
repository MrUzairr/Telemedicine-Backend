const PaletteDetail = require('../model/paletteDetailModel');
const Palette = require('../model/paletteModel');

// Create PaletteDetail and automatically create a unique Palette with template_id
const createPaletteDetail = async (req, res) => {
  try {
    const { details } = req.body;
    console.log(details)

    // Validate input
    if (!details || !Array.isArray(details) || details.length === 0) {
      return res.status(400).json({ error: 'Details must be a non-empty array' });
    }

    // Find the Palette with the largest template_id
    let latestPalette = await Palette.findOne().sort({ template_id: -1 });
    const newTemplateId = latestPalette ? latestPalette.template_id + 1 : 1;

    // Create a new Palette with the generated template_id
    const palette = new Palette({ template_id: newTemplateId });

    try {
      await palette.save();
      console.log('New Palette saved:', palette);
    } catch (error) {
      console.error('Error saving Palette:', error.message);
      return res.status(500).json({ error: 'Failed to save Palette', details: error.message });
    }

    // Prepare PaletteDetail documents
    const paletteDetails = details.map(detail => ({
      template_id: newTemplateId, // Link to the palette
      details: [
        {
          label: detail.label,
          value: detail.value
        }
      ]
    }));

    // Save PaletteDetails in bulk
    try {
      const savedDetails = await PaletteDetail.insertMany(paletteDetails);
      return res.status(201).json({
        message: 'Palette and PaletteDetails created successfully',
        palette,
        details: savedDetails,
      });
    } catch (error) {
      console.error('Error saving PaletteDetails:', error.message);
      return res.status(500).json({ error: 'Failed to save PaletteDetails', details: error.message });
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Get All PaletteDetails
const getPaletteDetails = async (req, res) => {
  try {
    const paletteDetails = await PaletteDetail.find();
    res.status(200).json(paletteDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a PaletteDetail

const updatePaletteDetail = async (req, res) => {
  try {
    const { label, value } = req.body;
    const { id } = req.params;  // This is the _id of the details object
    
    console.log('Updating detail with ID:', id);
    console.log('New label:', label, 'New value:', value);

    // Find the parent document by _id (not the details._id)
    const parentDocument = await PaletteDetail.findOne({ 'details._id': id });
    if (!parentDocument) {
      return res.status(404).json({ error: 'Parent document with the specified detail not found' });
    }

    console.log("Parent Document:", parentDocument);

    // Find the index of the detail object within the details array
    const detailIndex = parentDocument.details.findIndex(detail => detail._id.toString() === id);
    if (detailIndex === -1) {
      return res.status(404).json({ error: 'Detail object not found in the parent document' });
    }

    // Update the label and value of the specific detail
    parentDocument.details[detailIndex].label = label;
    parentDocument.details[detailIndex].value = value;

    // Save the updated parent document
    const updatedDocument = await parentDocument.save();

    console.log('Updated Document:', updatedDocument);  // Log the updated document for debugging

    // Send the updated document back as the response
    res.json(updatedDocument);

  } catch (err) {
    console.error('Error during update:', err);  // Log any errors that occur
    res.status(500).send({ error: 'Failed to update palette detail' });
  }
};


// const updatePaletteDetail = async (req, res) => {
//   try {
//     const { label, value } = req.body;
//     const { id } = req.params;
//     console.log('Updating detail with ID:', id);
//     console.log('New label:', label, 'New value:', value);

//     // Check if the document exists
//     const existingDetail = await PaletteDetail.findById(id);
//     if (!existingDetail) {
//       return res.status(404).json({ error: 'PaletteDetail not found' });
//     }
//     console.log("existingDetail",existingDetail)
//     // Find the palette detail and update the label and value
//     const updatedDetail = await PaletteDetail.findByIdAndUpdate(
//       id,
//       { $set: { 'details.0.label': label, 'details.0.value': value } },
//       { new: true } // return the updated document
//     );

//     console.log('Updated Detail:', updatedDetail); // Log the updated detail
//     res.json(updatedDetail);  // Send back the updated detail

//   } catch (err) {
//     console.error('Error during update:', err);  // Log the error
//     res.status(500).send({ error: 'Failed to update palette detail' });
//   }
// };


// const updatePaletteDetail = async (req, res) => {
//   try {
//     const { label, value } = req.body;
//     const { id } = req.params;
//     console.log('Updating detail with ID:', id);
//     console.log('New label:', label, 'New value:', value);


//     // Find the palette detail and update the label and value
//     const updatedDetail = await PaletteDetail.findByIdAndUpdate(
//       id,
//       { $set: { 'details.0.label': label, 'details.0.value': value } },
//       { new: true } // return the updated document
//     );

//     res.json(updatedDetail);
//   } catch (err) {
//     res.status(500).send({ error: 'Failed to update palette detail' });
//   }
// }

// Delete a PaletteDetail
const deletePaletteDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const paletteDetail = await PaletteDetail.findByIdAndDelete(id);
    if (!paletteDetail) return res.status(404).json({ message: 'PaletteDetail not found' });
    res.status(200).json({ message: 'PaletteDetail deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createPaletteDetail, getPaletteDetails, updatePaletteDetail, deletePaletteDetail };

// const createPaletteDetail = async (req, res) => {
//   try {
//     const { label, value } = req.body;
//     console.log(req.body)

//     // Check if a Palette with the required template_id already exists.
//     let palette = await Palette.findOne().sort({ template_id: -1 }); // Get the Palette with the largest template_id
//     const newTemplateId = palette ? palette.template_id + 1 : 1; // Increment template_id by 1 (or start at 1)
//     // Create a new Palette with the unique template_id
//     palette = new Palette({ template_id: newTemplateId });
//     console.log("i am the updated",palette)
//     // Save the new Palette
//     // Attempt to save the Palette
//     try {
//       await palette.save();
//       console.log('New Palette saved:', palette);
//     } catch (saveError) {
//       console.error('Error saving Palette:', saveError.message);
//       return res.status(500).json({ error: 'Failed to save Palette', details: saveError.message });
//     }

//     console.log("i am the saved",palette)


//     // Create PaletteDetail and associate with the newly generated template_id
//     const paletteDetail = new PaletteDetail({
//       label,
//       value,
//       template_id: palette.template_id // Use the generated template_id
//     });
//     console.log("paletteDetail",paletteDetail)
//     // Save PaletteDetail to the database
//     await paletteDetail.save();

//     res.status(201).json(paletteDetail);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };