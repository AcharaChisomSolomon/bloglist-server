const express = require('express');
require('express-async-errors');

const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./utils/config');
const loginRouter = require('./controllers/login');
const usersRouter = require('./controllers/users');
const blogRouter = require('./controllers/blogs');
const middlewares = require('./utils/middlewares');

mongoose.connect(config.MONGODB_URI);

app.use(cors());
app.use(express.json());
app.use(middlewares.requestLogger);

app.use('/api/login', loginRouter);
app.use('/api/users', usersRouter);
app.use('/api/blogs', middlewares.tokenExtractor, middlewares.userExtractor, blogRouter);

if (config.NODE_ENV === 'test') {
    // eslint-disable-next-line global-require
    const testingRouter = require('./controllers/testing');
    app.use('/api/testing', testingRouter);
}

app.use(middlewares.errorHandler);
app.use(middlewares.unknownEndpoint);

module.exports = app;
