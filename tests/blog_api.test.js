const {
    test, after, describe, beforeEach,
} = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);
const helper = require('../utils/test_helper');
const Blog = require('../models/blog');
const User = require('../models/user');

let token = '';

describe('when there is initially some blogs saved', () => {
    beforeEach(async () => {
        await Blog.deleteMany({});

        const blogs = await helper.getListWithMultipleBlogs();
        const users = await helper.usersInDb();
        let user = users[0];
        user = await User.findById(user.id);

        const response = await api
            .post('/api/login')
            .send({ username: 'first', password: 'cheesee' });

        token = response.body.token;

        for (const blog of blogs) {
            delete blog.userId;
            const newBlog = await new Blog({ ...blog, user: user.id }).save();
            user.blogs = user.blogs.concat(newBlog._id);
            await user.save();
        }
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
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect('Content-Type', /application\/json/);

            const processedBlogToView = JSON.parse(JSON.stringify(blogToView));
            assert.strictEqual(resultBlog.body.user.id, processedBlogToView.user.toString());
        });

        test('fails with statuscode 404 if blog does not exist', async () => {
            const validNonexistingId = await helper.nonExistingId();

            await api
                .get(`/api/blogs/${validNonexistingId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(404);
        });

        test('fails with statuscode 400 if id is invalid', async () => {
            const invalidId = '5a3d5da59070081a82a3445';

            await api
                .get(`/api/blogs/${invalidId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(400);
        });
    });

    describe('addition of a new blog', () => {
        test('a blog with valid data can be added', async () => {
            const usersAtStart = await helper.usersInDb();
            let user = usersAtStart[0];
            user = await User.findById(user.id);

            const newBlog = {
                title: 'New Blog Post',
                author: 'New Author',
                url: 'http://www.example.com',
                likes: 3,
                userId: user.id,
            };

            const response = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
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
            const usersAtStart = await helper.usersInDb();
            const user = usersAtStart[0];

            const newBlog = {
                title: 'New Blog Post',
                author: 'New Author',
                url: 'http://www.example.com',
                userId: user.id,
            };

            const response = await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(201)
                .expect('Content-Type', /application\/json/);

            assert.strictEqual(response.body.likes, 0);
        });

        test('if title and url properties are missing, response status is 400', async () => {
            const usersAtStart = await helper.usersInDb();
            const user = usersAtStart[0];

            const newBlog = {
                author: 'New Author',
                userId: user.id,
            };

            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(400);
        });

        test('if token is missing, response status is 401', async () => {
            const usersAtStart = await helper.usersInDb();
            let user = usersAtStart[0];
            user = await User.findById(user.id);

            const newBlog = {
                title: 'New Blog Post',
                author: 'New Author',
                url: 'http://www.example.com',
                userId: user.id,
            };

            const response = await api.post('/api/blogs').send(newBlog).expect(401);
            assert.strictEqual(response.body.error, 'missing or invalid token');
        });
    });

    describe('deletion of a blog', () => {
        test('succeeds with status code 204 if id is valid', async () => {
            const blogsAtStart = await helper.blogsInDb();
            const blogToDelete = blogsAtStart[1];

            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(204);

            const blogsAtEnd = await helper.blogsInDb();

            assert.strictEqual(
                blogsAtEnd.length,
                helper.listWithMultipleBlogs.length - 1,
            );

            const titles = blogsAtEnd.map((r) => r.title);

            assert(!titles.includes(blogToDelete.title));
        });

        test('if user is unauthorized, response status is 401', async () => {
            const blogsAtStart = await helper.blogsInDb();
            const blogToUpdate = blogsAtStart[0];

            const user = await User.create({
                username: 'unauthorized',
                name: 'Unauthorized User',
                passwordHash: await bcrypt.hash('unauthorized', 10),
            });
            await user.save();

            const newToken = await api
                .post('/api/login')
                .send({ username: 'unauthorized', password: 'unauthorized' });
            token = newToken.body.token;

            const newBlog = {
                ...blogToUpdate,
                likes: blogToUpdate.likes + 1,
            };

            const response = await api
                .delete(`/api/blogs/${blogToUpdate.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(newBlog)
                .expect(401);

            const blogsAtEnd = await helper.blogsInDb();
            assert.strictEqual(response.body.error, 'unauthorized user');
            assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
        });

        test('fails with status code 400 `blog already deleted` if blog does not exist', async () => {
            const nonExistingId = await helper.nonExistingId();
            const blogsAtStart = await helper.blogsInDb();

            const response = await api
                .delete(`/api/blogs/${nonExistingId}`)
                .set('Authorization', `Bearer ${token}`)
                .expect(400);

            const blogsAtEnd = await helper.blogsInDb();
            assert.strictEqual(blogsAtEnd.length, blogsAtStart.length);
            assert.strictEqual(response.body.error, 'blog already deleted');
        });
    });

    describe('updating a blog', () => {
        test('succeeds with a valid id', async () => {
            const blogsAtStart = await helper.blogsInDb();
            const blogToUpdate = blogsAtStart[0];

            const updatedBlog = {
                ...blogToUpdate,
                likes: blogToUpdate.likes + 1,
            };

            const response = await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updatedBlog)
                .expect(200);

            const blogsAtEnd = await helper.blogsInDb();
            assert.deepStrictEqual(
                {
                    ...blogsAtEnd[0],
                    user: blogsAtEnd[0].user.toString(),
                },
                response.body,
            );
        });

        test('fails with status code 400 `blog not found` if blog does not exist', async () => {
            const nonExistingId = await helper.nonExistingId();
            const blogsAtStart = await helper.blogsInDb();
            const blogToUpdate = blogsAtStart[0];

            const updatedBlog = {
                ...blogToUpdate,
                likes: blogToUpdate.likes + 1,
            };

            const response = await api
                .put(`/api/blogs/${nonExistingId}`)
                .set('Authorization', `Bearer ${token}`)
                .send(updatedBlog)
                .expect(400);
            assert.strictEqual(response.body.error, 'blog not found');
        });
    });
});

after(() => {
    Blog.deleteMany({});
    User.deleteMany({});
    mongoose.connection.close();
});
