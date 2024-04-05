const { test, describe } = require('node:test');
const assert = require('node:assert');
const listHelper = require('../utils/list_helper');
const { listWithOneBlog, listWithMultipleBlogs } = require('../utils/test_helper');

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

    test('when list has only one blog equals the blog in the list', () => {
        const result = listHelper.favoriteBlog(listWithOneBlog);
        assert.deepStrictEqual(result, listWithOneBlog[0]);
    });

    test('of a bigger list is calculated right', () => {
        const result = listHelper.favoriteBlog(listWithMultipleBlogs);
        assert.deepStrictEqual(result, listWithMultipleBlogs[2]);
    });
});

describe('most blogs', () => {
    test('of empty list is an empty object', () => {
        const result = listHelper.mostBlogs([]);
        assert.deepStrictEqual(result, {});
    });

    test('when list has only one blog equals the author of that', () => {
        const result = listHelper.mostBlogs(listWithOneBlog);
        assert.deepStrictEqual(result, {
            author: 'Author 1',
            blogs: 1,
        });
    });

    test('of a bigger list is calculated right', () => {
        const result = listHelper.mostBlogs(listWithMultipleBlogs);
        assert.deepStrictEqual(result, {
            author: 'Author 1',
            blogs: 2,
        });
    });
});

describe('most likes', () => {
    test('of empty list is an empty object', () => {
        const result = listHelper.mostLikes([]);
        assert.deepStrictEqual(result, {});
    });

    test('when list has only one blog equals the author of that', () => {
        const result = listHelper.mostLikes(listWithOneBlog);
        assert.deepStrictEqual(result, {
            author: 'Author 1',
            likes: 4,
        });
    });

    test('of a bigger list is calculated right', () => {
        const result = listHelper.mostLikes(listWithMultipleBlogs);
        assert.deepStrictEqual(result, {
            author: 'Author 1',
            likes: 10,
        });
    });
});
