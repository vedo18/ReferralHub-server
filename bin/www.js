require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');

const config = require('../src/config/config');
const logger = require('../src/config/logger');
const app = require('../src/app');

mongoose.Promise = require('bluebird');

let server = null;

const exitHandler = () => {
  Promise.all([mongoose.connection.readyState ? mongoose.connection.close() : () => {}, server ? server.close() : () => {}])
    .then(process.exit(0))
    .catch((error) => {
      logger.error('Could not close connections, forcefully shutting down because of:\n', error);
      process.exit(1);
    });

  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

const unexpectedErrorHandler = (error) => {
  switch (error.code) {
    case 'EACCES':
      logger.error(`${config.port} requires elevated privileges`);
      exitHandler();
      break;
    case 'EADDRINUSE':
      logger.error(`${config.port} is already in use`);
      exitHandler();
      break;
    default:
      logger.error(error);
      exitHandler();
  }
};

const onListening = () => {
  const addr = server.address();
  logger.info(`Listening on port ${addr.port}`);
};

mongoose
  .connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    logger.info('Connected to DataBase');

    server = http.createServer(app);

    server.listen(config.port);
    server.on('error', unexpectedErrorHandler);
    server.on('listening', onListening);
  })
  .catch(unexpectedErrorHandler);

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', unexpectedErrorHandler);
process.on('SIGINT', unexpectedErrorHandler);
