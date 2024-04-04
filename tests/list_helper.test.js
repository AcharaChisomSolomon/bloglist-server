const { test, describe } = require('node:test');
const assert = require('node:assert');
const listHelper = require('../utils/list_helper');
const { listWithOneBlog, listWithMultipleBlogs } = require('./test_helper');

test('dummy returns one', () => {
    const blogs = [];

    const result = listHelper.dummy(blogs);
    assert.strictEqual(result, 1);
});

describe('total likes', () => {
    test('of empty list is zero', () => {
        const result = listHelper.totalLikes([]);
        assert.strictEqual(result, 0);
    });

    test('when list has only one blog equals the likes of that', () => {
        const result = listHelper.totalLikes(listWithOneBlog);
        assert.strictEqual(result, 4);
    });

    test('of a bigger list is calculated right', () => {
        const result = listHelper.totalLikes(listWithMultipleBlogs);
        assert.strictEqual(result, 20);
    });
});

describe('favorite blog', () => {
    test('of empty list is an empty object', () => {
        const result = listHelper.favoriteBlog([]);
        assert.deepStrictEqual(result, {});
    });

    test('when list has only one blog equals the likes of that', () => {
        const result = listHelper.favoriteBlog(listWithOneBlog);
        assert.deepStrictEqual(result, listWithOneBlog[0]);
    });

    test('of a bigger list is calculated right', () => {
        const result = listHelper.favoriteBlog(listWithMultipleBlogs);
        assert.deepStrictEqual(result, listWithMultipleBlogs[2]);
    });
});
