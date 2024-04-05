const express = require('express');
require('express-async-errors');

const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const config = require('./utils/config');
const usersRouter = require('./controllers/users');
const blogRouter = require('./controllers/blogs');
const middlewares = require('./utils/middlewares');

mongoose.connect(config.MONGODB_URI);

app.use(cors());
app.use(express.json());
app.use(middlewares.requestLogger);

app.use('/api/users', usersRouter);
app.use('/api/blogs', blogRouter);

app.use(middlewares.errorHandler);
app.use(middlewares.unknownEndpoint);

module.exports = app;
