const express = require('express');
const router = express.Router();
const paletteDetailController = require('../controller/paletteDetailController');

// PaletteDetail Routes
router.post('/palette-details', paletteDetailController.createPaletteDetail);
router.get('/get-palette-details', paletteDetailController.getPaletteDetails);
router.put('/update-palette-details/:id', paletteDetailController.updatePaletteDetail);
router.delete('/delete-palette-details/:id', paletteDetailController.deletePaletteDetail);

module.exports = router;
