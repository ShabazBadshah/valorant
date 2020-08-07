const express = require('express');
const express_graphql = require('express-graphql');
const cors = require('cors');

const PORT = 8081;
// GraphQL schema
const schema = require('./schema');

// const Knex = require("knex");
// const knex = Knex({
//   client: 'pg',
//   connection: { 
//     host: '142.1.46.70', 
//     user: 'postgres', 
//     password: 'postgres', 
//     database: 'patient_db', 
//     port: 8088
//     },
// });

// Root resolver
const root = {
  message: () => 'Hello this is the booking service connecting to the bookings and appointments db!',
};

// Create an express server and a GraphQL endpoint
const app = express();
app.use(cors());
app.use(
  '/graphql',
  express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
  })
);

const server = app
  .listen(PORT, () => {
    console.log(`Express GraphQL Server Now Running On localhost:${PORT}/graphql`);
  })
  .on('error', (error) => {
    console.log('Port in use. Existing program');
    console.error(error);
    process.exit(1);
  });

module.exports = server;
