const express = require('express');
const controller = require('../controller/studio');
const {ValidateJoi, Schemas} = require("../middleware/joi");

const router = express.Router();

router.post('/', ValidateJoi(Schemas.studio.create), controller.createStudio);
router.get('/:studio_id', controller.readStudioByStudioId);
router.get('/', controller.readStudiosBytenant);
router.patch('/:studio_id', ValidateJoi(Schemas.studio.update), controller.updateStudio);
// router.patch('/disable/:studio_id', controller.disableStudio);

module.exports = router;
