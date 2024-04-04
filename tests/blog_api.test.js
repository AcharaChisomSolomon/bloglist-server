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

    test('a specific blog is within the returned blogs', async () => {
        const response = await api.get('/api/blogs');

        const titles = response.body.map((r) => r.title);
        assert(titles.includes('Blog Post 1'));
    });

    test('they all have the id property', async () => {
        const response = await api.get('/api/blogs');

        response.body.forEach((blog) => {
            assert(blog.id);
        });
    });

    describe('viewing a specific blog', () => {
        test('succeeds with a valid id', async () => {
            const blogsAtStart = await helper.blogsInDb();
            const blogToView = blogsAtStart[0];

            const resultBlog = await api
                .get(`/api/blogs/${blogToView.id}`)
                .expect(200)
                .expect('Content-Type', /application\/json/);

            const processedBlogToView = JSON.parse(JSON.stringify(blogToView));
            assert.deepStrictEqual(resultBlog.body, processedBlogToView);
        });

        test('fails with statuscode 404 if blog does not exist', async () => {
            const validNonexistingId = await helper.nonExistingId();

            await api
                .get(`/api/blogs/${validNonexistingId}`)
                .expect(404);
        });

        test('fails with statuscode 400 if id is invalid', async () => {
            const invalidId = '5a3d5da59070081a82a3445';

            await api.get(`/api/blogs/${invalidId}`).expect(400);
        });
    });

    describe('addition of a new blog', () => {
        test('a blog with valid data can be added', async () => {
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
            assert.strictEqual(
                blogsAtEnd.length,
                helper.listWithMultipleBlogs.length + 1,
            );
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

            await api.post('/api/blogs').send(newBlog).expect(400);
        });
    });

    describe('deletion of a blog', () => {
        test('succeeds with status code 204 if id is valid', async () => {
            const blogsAtStart = await helper.blogsInDb();
            const blogToDelete = blogsAtStart[1];

            await api.delete(`/api/blogs/${blogToDelete.id}`).expect(204);

            const blogsAtEnd = await helper.blogsInDb();

            assert.strictEqual(
                blogsAtEnd.length,
                helper.listWithMultipleBlogs.length - 1,
            );

            const titles = blogsAtEnd.map((r) => r.title);

            assert(!titles.includes(blogToDelete.title));
        });
    });
});

after(() => {
    mongoose.connection.close();
});
