const _ = require('lodash');

// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => 1;

const totalLikes = (blogs) => {
    const reducer = (sum, item) => sum + item.likes;

    return blogs.length === 0 ? 0 : blogs.reduce(reducer, 0);
};

const favoriteBlog = (blogs) => {
    const reducer = (prev, current) => (prev.likes > current.likes ? prev : current);

    return blogs.length === 0 ? {} : blogs.reduce(reducer, {});
};

const mostBlogs = (blogs) => {
    const count = _.countBy(blogs, 'author');
    const author = _.maxBy(Object.keys(count), (o) => count[o]);

    return blogs.length === 0 ? {} : {
        author,
        blogs: count[author],
    };
};

const mostLikes = (blogs) => {
    const grouped = _.groupBy(blogs, 'author');
    const authors = Object.keys(grouped);
    const likes = authors.map((author) => {
        const total = grouped[author].reduce((sum, blog) => sum + blog.likes, 0);
        return { author, likes: total };
    });

    return blogs.length === 0 ? {} : _.maxBy(likes, 'likes');
};

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
};
