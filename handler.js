'use strict';
const app = require('./src/app');
const serverless = require('serverless-http');

module.exports.multiTenantApp = serverless(app);
