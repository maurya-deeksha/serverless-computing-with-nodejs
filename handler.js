'use strict';
const app = require('./src/app');
const serverless = require('serverless-http');

module.exports.hello = serverless(app);
