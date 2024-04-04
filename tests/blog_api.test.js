const {
    test,
    after,
    describe,
    beforeEach,
} = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
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

        const blogsAtEnd = await helper.blogsInDb();
        assert.strictEqual(response.body.length, blogsAtEnd.length);
    });

    test('they all have the id property', async () => {
        const response = await api.get('/api/blogs');

        response.body.forEach((blog) => {
            assert(blog.id);
        });
    });

    test('a blog can be added', async () => {
        const newBlog = {
            title: 'New Blog Post',
            author: 'New Author',
            url: 'http://www.example.com',
            likes: 3,
        };

        const response = await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/);

        const blogsAtEnd = await helper.blogsInDb();
        assert.strictEqual(response.body.likes, 3);
        assert.strictEqual(blogsAtEnd.length, helper.listWithMultipleBlogs.length + 1);
    });

    test('if likes property is missing, it defaults to 0', async () => {
        const newBlog = {
            title: 'New Blog Post',
            author: 'New Author',
            url: 'http://www.example.com',
        };

        const response = await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/);

        assert.strictEqual(response.body.likes, 0);
    });

    test('if title and url properties are missing, response status is 400', async () => {
        const newBlog = {
            author: 'New Author',
        };

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400);
    });
});

after(() => {
    mongoose.connection.close();
});
