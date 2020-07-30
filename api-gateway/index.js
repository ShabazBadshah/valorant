const express = require('express');

const loadMiddlewareStack = require('./src/middlewares/middleware.js');

const gqlRequests = require('./src/network-utils/gql-requests.js');

const APP_PORT = process.env.APP_PORT || 8085;

const app = express();

loadMiddlewareStack(app);

// Gateway endpoints
app.use('/', require('./src/routes/routes.js'));

// GraphlQL endpoint to proxy to other services
app.post('/api', (req, res) => {
  const { query: gqlQueryString, variables: gqlQueryVariables } = req.body;

  const response = gqlRequests.sendGqlRequest('http://192.168.1.114:3002/api', gqlQueryString, gqlQueryVariables);
  response
    .then((data) => {
      res.json(data);
    })
    .catch((err) => {
      res.json({
        message: 'Request failed',
        error: err.message
      });
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
