const {
    describe,
    beforeEach,
    test,
    after,
} = require('node:test');
const assert = require('node:assert');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);
const User = require('../models/user');
const helper = require('../utils/test_helper');

describe('when there is initially one user in the db', () => {
    beforeEach(async () => {
        await User.deleteMany({});

        const passwordHash = await bcrypt.hash('password', 10);
        const user = new User({ username: 'root', passwordHash });

        await user.save();
    });

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        };

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/);

        const usersAtEnd = await helper.usersInDb();
        assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

        const usernames = usersAtEnd.map((u) => u.username);
        assert(usernames.includes(newUser.username));
    });

    test('creation fails with proper statuscode and message if username already taken', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        };

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        assert(result.body.error.includes('expected `username` to be unique'));

        const usersAtEnd = await helper.usersInDb();
        assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });

    test('creation fails with proper statuscode and message if username is missing', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            name: 'Superuser',
            password: 'salainen',
        };

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        assert(result.body.error.includes('`username` is required'));

        const usersAtEnd = await helper.usersInDb();
        assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });

    test('creation fails with proper statuscode and message if username is less than 3 characters long', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: 'ro',
            name: 'Superuser',
            password: 'salainen',
        };

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        assert(result.body.error.includes('is shorter than the minimum allowed length'));

        const usersAtEnd = await helper.usersInDb();
        assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });

    test('creation fails with proper statuscode and message if password is missing', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: 'root',
            name: 'Superuser',
        };

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        assert(result.body.error.includes('Password must be at least 3 characters long'));

        const usersAtEnd = await helper.usersInDb();
        assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });

    test('creation fails with proper statuscode and message if password is less than 3 characters long', async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'sa',
        };

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/);

        assert(result.body.error.includes('Password must be at least 3 characters long'));

        const usersAtEnd = await helper.usersInDb();
        assert.strictEqual(usersAtEnd.length, usersAtStart.length);
    });
});

after(() => {
    mongoose.connection.close();
});
