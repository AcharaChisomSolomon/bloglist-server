const {
    test,
    after,
    describe,
    beforeEach,
} = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);
const helper = require('./test_helper');
const Blog = require('../models/blog');

describe('when there is initially some blogs saved', () => {
    beforeEach(async () => {
        await Blog.deleteMany({});
        await Blog.insertMany(helper.listWithMultipleBlogs);
    });

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/);
    });

    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs');

        assert.strictEqual(response.body.length, helper.listWithMultipleBlogs.length);
    });
});

after(() => {
    mongoose.connection.close();
});
