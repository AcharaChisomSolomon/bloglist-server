// eslint-disable-next-line import/no-extraneous-dependencies
require('dotenv').config();

const { PORT } = process.env;
const { NODE_ENV } = process.env;

const MONGODB_URI = process.env.NODE_ENV === 'test'
    ? process.env.TEST_MONGODB_URI
    : process.env.MONGODB_URI;

module.exports = {
    MONGODB_URI,
    PORT,
    NODE_ENV,
};
