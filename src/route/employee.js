const express = require('express');
const controller = require('../controller/employee');
const {ValidateJoi, Schemas} = require("../middleware/joi");

const router = express.Router();

router.post('/',ValidateJoi(Schemas.employee.create), controller.createEmployee);
router.get('/:employee_id', controller.readEmployeeById);
router.get('/', controller.readAllEmployee);
router.get('/get/:studio_code', controller.readUserByStudioId);
router.patch('/:employee_id', ValidateJoi(Schemas.employee.update), controller.updateEmployee);
// router.patch('/disable/:employee_id', controller.deleteEmployee);

module.exports = router;
