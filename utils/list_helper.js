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

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
};
