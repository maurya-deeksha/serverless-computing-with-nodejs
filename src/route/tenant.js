const express = require('express');
const controller = require('../controller/tenant') ;
const {Schemas, ValidateJoi} = require("../middleware/joi");

const router = express.Router();

router.post('/', ValidateJoi(Schemas.tenant.create), controller.createTenant);
router.get('/:tenant_id', controller.readTenantById);
router.get('/', controller.readAllTenant);
router.patch('/:tenant_id', ValidateJoi(Schemas.tenant.update), controller.updateTenant);
// router.patch('/disable/:tenant_id', controller.disableTenant);
// router.post('/login', ValidateJoi(Schemas.tenant.login), controller.tenantLogin);

module.exports =  router;
