/* eslint-disable require-jsdoc */
const express = require('express');

const loadMiddlewareStack = require('./src/middlewares');

const healthcheckController = require('./src/controllers/healthcheck-controller.js');
const httpStatusCode = require('./src/utils/http-status-code.js');

const APP_PORT = process.env.APP_PORT || 8085;

const app = express();

loadMiddlewareStack(app);

// GraphlQL endpoint
app.get('/api', (req, res) => {
  res.json({ data: 'Hello World!' });
});

app.use('/healthcheck', (req, res) => {
  res.status(httpStatusCode.OK).json({
    serviceName: 'API Gateway',
    message: `Pinging /healthcheck on API Gateway`,
    data: healthcheckController.getHealthcheckInfo(req)
  });
});

// Match any route if it is not found within allRoutes
app.use('*', (req, res, next) => {
  res.status(404).json({
    message: 'Route does not exist',
    method: req.method,
    routeRequested: req.originalUrl
  });
  next();
});

const server = app
  .listen(APP_PORT, () => {
    console.log(`API Gateway running on localhost:${APP_PORT} in ${process.env.NODE_ENV} mode`);
  })
  .on('error', (error) => {
    console.error(error);
  });

module.exports = {
  app,
  server
};
